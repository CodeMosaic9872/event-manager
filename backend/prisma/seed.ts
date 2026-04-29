import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

type TaxonomyRow = {
  eventType: string;
  eventTypeEn?: string | null;
  mainCategory: string;
  mainCategoryEn?: string | null;
  subCategories: string[];
  subCategoriesEn?: Array<string | null> | null;
};

function stableHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function toKey(prefix: string, value: string): string {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (normalized.length > 0) {
    return `${prefix}_${normalized}`;
  }
  return `${prefix}_${stableHash(value)}`;
}

async function main() {
  const taxonomyPath = join(process.cwd(), 'prisma', 'data', 'event-taxonomy.json');
  const taxonomyRows = JSON.parse(readFileSync(taxonomyPath, 'utf8')) as TaxonomyRow[];

  const eventTypeNamesByKey = new Map<string, { he: string; en: string | null }>();
  const categoryNamesByKey = new Map<string, { he: string; en: string | null }>();
  const subcategoryNamesByCategoryAndKey = new Map<string, { he: string; en: string | null }>();

  for (const row of taxonomyRows) {
    const eventTypeLabelForKey = row.eventTypeEn?.trim() || row.eventType;
    const categoryLabelForKey = row.mainCategoryEn?.trim() || row.mainCategory;
    const eventTypeKey = toKey('event_type', eventTypeLabelForKey);
    const categoryKey = toKey('category', categoryLabelForKey);
    eventTypeNamesByKey.set(eventTypeKey, { he: row.eventType, en: row.eventTypeEn ?? null });
    categoryNamesByKey.set(categoryKey, { he: row.mainCategory, en: row.mainCategoryEn ?? null });

    for (let index = 0; index < row.subCategories.length; index += 1) {
      const subcategoryName = row.subCategories[index];
      const subcategoryNameEn = row.subCategoriesEn?.[index] ?? null;
      const subcategoryLabelForKey = subcategoryNameEn?.trim() || subcategoryName;
      const subcategoryKey = toKey('subcategory', subcategoryLabelForKey);
      subcategoryNamesByCategoryAndKey.set(`${categoryKey}::${subcategoryKey}`, {
        he: subcategoryName,
        en: subcategoryNameEn,
      });
    }
  }

  const eventTypeIdByKey = new Map<string, string>();
  for (const [eventTypeKey, eventTypeName] of eventTypeNamesByKey.entries()) {
    const eventType = await prisma.eventType.upsert({
      where: { key: eventTypeKey },
      update: { name: eventTypeName.he, nameEn: eventTypeName.en, isActive: true },
      create: { key: eventTypeKey, name: eventTypeName.he, nameEn: eventTypeName.en },
      select: { id: true },
    });
    eventTypeIdByKey.set(eventTypeKey, eventType.id);
  }

  const categoryIdByKey = new Map<string, string>();
  let categorySortOrder = 1;
  for (const [categoryKey, categoryName] of categoryNamesByKey.entries()) {
    const category = await prisma.category.upsert({
      where: { key: categoryKey },
      update: { name: categoryName.he, nameEn: categoryName.en, sortOrder: categorySortOrder, isActive: true },
      create: { key: categoryKey, name: categoryName.he, nameEn: categoryName.en, sortOrder: categorySortOrder },
      select: { id: true },
    });
    categoryIdByKey.set(categoryKey, category.id);
    categorySortOrder += 1;
  }

  const subcategoryIdByCategoryAndKey = new Map<string, string>();
  const subcategorySortOrderByCategory = new Map<string, number>();
  for (const [categoryAndKey, subcategoryName] of subcategoryNamesByCategoryAndKey.entries()) {
    const [categoryKey, subcategoryKey] = categoryAndKey.split('::');
    const categoryId = categoryIdByKey.get(categoryKey);
    if (!categoryId) {
      continue;
    }
    const sortOrder = subcategorySortOrderByCategory.get(categoryId) ?? 1;
    const subcategory = await prisma.subcategory.upsert({
      where: { categoryId_key: { categoryId, key: subcategoryKey } },
      update: { name: subcategoryName.he, nameEn: subcategoryName.en, sortOrder, isActive: true },
      create: { categoryId, key: subcategoryKey, name: subcategoryName.he, nameEn: subcategoryName.en, sortOrder },
      select: { id: true },
    });
    subcategoryIdByCategoryAndKey.set(`${categoryKey}::${subcategoryKey}`, subcategory.id);
    subcategorySortOrderByCategory.set(categoryId, sortOrder + 1);
  }

  const mappingPriorityByEventAndCategory = new Map<string, number>();
  for (const row of taxonomyRows) {
    const eventTypeLabelForKey = row.eventTypeEn?.trim() || row.eventType;
    const categoryLabelForKey = row.mainCategoryEn?.trim() || row.mainCategory;
    const eventTypeKey = toKey('event_type', eventTypeLabelForKey);
    const categoryKey = toKey('category', categoryLabelForKey);
    const eventTypeId = eventTypeIdByKey.get(eventTypeKey);
    const categoryId = categoryIdByKey.get(categoryKey);
    if (!eventTypeId || !categoryId) {
      continue;
    }

    const priorityKey = `${eventTypeId}::${categoryId}`;
    let nextPriority = mappingPriorityByEventAndCategory.get(priorityKey) ?? 1;

    for (let index = 0; index < row.subCategories.length; index += 1) {
      const subcategoryName = row.subCategories[index];
      const subcategoryNameEn = row.subCategoriesEn?.[index] ?? null;
      const subcategoryLabelForKey = subcategoryNameEn?.trim() || subcategoryName;
      const subcategoryKey = toKey('subcategory', subcategoryLabelForKey);
      const subcategoryId = subcategoryIdByCategoryAndKey.get(`${categoryKey}::${subcategoryKey}`);
      if (!subcategoryId) {
        continue;
      }
      await prisma.eventCategorySubcategoryMap.upsert({
        where: {
          eventTypeId_categoryId_subcategoryId: {
            eventTypeId,
            categoryId,
            subcategoryId,
          },
        },
        update: {
          priority: nextPriority,
          isDefault: index === 0,
        },
        create: {
          eventTypeId,
          categoryId,
          subcategoryId,
          priority: nextPriority,
          isDefault: index === 0,
        },
      });
      nextPriority += 1;
    }
    mappingPriorityByEventAndCategory.set(priorityKey, nextPriority);
  }

  const locationFilter = await prisma.filterDefinition.findFirst({
    where: { scope: 'GLOBAL', categoryId: null, key: 'location' },
  });

  if (locationFilter) {
    await prisma.filterDefinition.update({
      where: { id: locationFilter.id },
      data: {
        label: 'Location',
        type: 'MULTI_SELECT',
        optionsJson: ['north', 'center', 'south'],
        isActive: true,
      },
    });
  } else {
    await prisma.filterDefinition.create({
      data: {
        scope: 'GLOBAL',
        categoryId: null,
        key: 'location',
        label: 'Location',
        type: 'MULTI_SELECT',
        optionsJson: ['north', 'center', 'south'],
      },
    });
  }

  const notificationTemplates = [
    {
      key: 'user.welcome',
      channel: 'EMAIL',
      subjectTemplate: 'Welcome to Event Marketplace',
      bodyTemplate:
        'Hi {{email}}, welcome to Event Marketplace. Start exploring suppliers and build your event plan today.',
    },
    {
      key: 'supplier.onboarding.abandoned',
      channel: 'EMAIL',
      subjectTemplate: 'Finish your supplier profile',
      bodyTemplate:
        'Your onboarding is {{completionPercent}}% complete at step "{{stepKey}}". Come back to complete your profile and start receiving leads.',
    },
  ] as const;

  for (const template of notificationTemplates) {
    await prisma.notificationTemplate.upsert({
      where: { key: template.key },
      update: {
        channel: template.channel,
        subjectTemplate: template.subjectTemplate,
        bodyTemplate: template.bodyTemplate,
      },
      create: template,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
