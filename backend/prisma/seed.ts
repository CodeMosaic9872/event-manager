import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const eventTypes = [
    { key: 'wedding', name: 'Wedding' },
    { key: 'corporate_event', name: 'Corporate Event' },
    { key: 'birthday', name: 'Birthday' },
  ];

  for (const eventType of eventTypes) {
    await prisma.eventType.upsert({
      where: { key: eventType.key },
      update: { name: eventType.name, isActive: true },
      create: eventType,
    });
  }

  const categories = [
    { key: 'food', name: 'Food', sortOrder: 1 },
    { key: 'music', name: 'Music', sortOrder: 2 },
    { key: 'photography', name: 'Photography', sortOrder: 3 },
    { key: 'venues', name: 'Venues', sortOrder: 4 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { key: category.key },
      update: { name: category.name, sortOrder: category.sortOrder, isActive: true },
      create: category,
    });
  }

  const foodCategory = await prisma.category.findUniqueOrThrow({ where: { key: 'food' } });
  const musicCategory = await prisma.category.findUniqueOrThrow({ where: { key: 'music' } });
  const weddingEvent = await prisma.eventType.findUniqueOrThrow({ where: { key: 'wedding' } });
  const corporateEvent = await prisma.eventType.findUniqueOrThrow({ where: { key: 'corporate_event' } });
  const birthdayEvent = await prisma.eventType.findUniqueOrThrow({ where: { key: 'birthday' } });

  const subcategories = [
    { categoryId: foodCategory.id, key: 'catering', name: 'Catering', sortOrder: 1 },
    { categoryId: foodCategory.id, key: 'desserts', name: 'Desserts', sortOrder: 2 },
    { categoryId: musicCategory.id, key: 'dj', name: 'DJ', sortOrder: 1 },
    { categoryId: musicCategory.id, key: 'live_band', name: 'Live Band', sortOrder: 2 },
  ];

  for (const subcategory of subcategories) {
    await prisma.subcategory.upsert({
      where: { categoryId_key: { categoryId: subcategory.categoryId, key: subcategory.key } },
      update: { name: subcategory.name, sortOrder: subcategory.sortOrder, isActive: true },
      create: subcategory,
    });
  }

  const cateringSubcategory = await prisma.subcategory.findUniqueOrThrow({
    where: { categoryId_key: { categoryId: foodCategory.id, key: 'catering' } },
  });
  const dessertsSubcategory = await prisma.subcategory.findUniqueOrThrow({
    where: { categoryId_key: { categoryId: foodCategory.id, key: 'desserts' } },
  });
  const djSubcategory = await prisma.subcategory.findUniqueOrThrow({
    where: { categoryId_key: { categoryId: musicCategory.id, key: 'dj' } },
  });
  const liveBandSubcategory = await prisma.subcategory.findUniqueOrThrow({
    where: { categoryId_key: { categoryId: musicCategory.id, key: 'live_band' } },
  });

  const mappings = [
    {
      eventTypeId: weddingEvent.id,
      categoryId: foodCategory.id,
      subcategoryId: cateringSubcategory.id,
      priority: 1,
      isDefault: true,
    },
    {
      eventTypeId: weddingEvent.id,
      categoryId: musicCategory.id,
      subcategoryId: liveBandSubcategory.id,
      priority: 2,
      isDefault: true,
    },
    {
      eventTypeId: corporateEvent.id,
      categoryId: foodCategory.id,
      subcategoryId: cateringSubcategory.id,
      priority: 1,
      isDefault: true,
    },
    {
      eventTypeId: corporateEvent.id,
      categoryId: musicCategory.id,
      subcategoryId: djSubcategory.id,
      priority: 2,
      isDefault: true,
    },
    {
      eventTypeId: birthdayEvent.id,
      categoryId: foodCategory.id,
      subcategoryId: dessertsSubcategory.id,
      priority: 1,
      isDefault: true,
    },
    {
      eventTypeId: birthdayEvent.id,
      categoryId: musicCategory.id,
      subcategoryId: djSubcategory.id,
      priority: 2,
      isDefault: false,
    },
  ];

  for (const mapping of mappings) {
    await prisma.eventCategorySubcategoryMap.upsert({
      where: {
        eventTypeId_categoryId_subcategoryId: {
          eventTypeId: mapping.eventTypeId,
          categoryId: mapping.categoryId,
          subcategoryId: mapping.subcategoryId,
        },
      },
      update: {
        priority: mapping.priority,
        isDefault: mapping.isDefault,
      },
      create: mapping,
    });
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
