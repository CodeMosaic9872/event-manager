import { PrismaClient, Prisma, PlatformRole } from '@prisma/client';
import { hash } from 'bcryptjs';
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

const SEED = {
  clientEmail: 'seed.client@example.com',
  clientPhone: '0501111001',
  supplierOwnerEmail: 'seed.supplier@example.com',
  supplierOwnerPhone: '0501111002',
  secondSupplierEmail: 'seed.supplier2@example.com',
  secondSupplierPhone: '0501111004',
  adminEmail: 'seed.admin@example.com',
  adminPhone: '0501111003',
  anonToken: 'seed_anon_session_token_001',
  supplierSlug: 'seed-catering-co',
  supplier2Slug: 'seed-dj-sounds',
} as const;

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

async function seedTaxonomyAndFilters() {
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

}

async function ensureUserRole(userId: string, role: PlatformRole) {
  await prisma.userRole.upsert({
    where: { userId_role: { userId, role } },
    update: {},
    create: { userId, role },
  });
}

async function seedSavedConcepts(clientUserId: string) {
  const samples = [
    {
      title: 'חתונה בגן — קונספט רוסטי',
      content:
        'טקס חוץ, שולחנות עץ, תאורה חמה, תפריט חלבי קליל, ודי ג\'יי אקוסטי לקבלת פנים.',
    },
    {
      title: 'אירוע חברה קיץ',
      content: 'בר קוקטיילים, עמדת פינגר פוד, הרצאת מפתח קצרה, ועמדת צילום.',
    },
  ];
  for (const sample of samples) {
    const existing = await prisma.savedEventConcept.findFirst({
      where: { userId: clientUserId, title: sample.title },
    });
    if (!existing) {
      await prisma.savedEventConcept.create({
        data: {
          userId: clientUserId,
          title: sample.title,
          content: sample.content,
        },
      });
    }
  }
}

async function seedEdgeCaseUsers() {
  const inactive = await prisma.user.upsert({
    where: { email: 'seed.inactive@example.com' },
    update: { phone: '0501111995', status: 'INACTIVE' },
    create: {
      email: 'seed.inactive@example.com',
      phone: '0501111995',
      status: 'INACTIVE',
      roles: { create: [{ role: 'USER' }] },
    },
  });
  await ensureUserRole(inactive.id, 'USER');

  const blocked = await prisma.user.upsert({
    where: { email: 'seed.blocked@example.com' },
    update: { phone: '0501111994', status: 'BLOCKED' },
    create: {
      email: 'seed.blocked@example.com',
      phone: '0501111994',
      status: 'BLOCKED',
      roles: { create: [{ role: 'USER' }] },
    },
  });
  await ensureUserRole(blocked.id, 'USER');
}

async function seedUsers() {
  const client = await prisma.user.upsert({
    where: { email: SEED.clientEmail },
    update: { phone: SEED.clientPhone, status: 'ACTIVE' },
    create: {
      email: SEED.clientEmail,
      phone: SEED.clientPhone,
      status: 'ACTIVE',
      roles: { create: [{ role: 'USER' }] },
    },
  });
  await ensureUserRole(client.id, 'USER');

  const supplierOwner = await prisma.user.upsert({
    where: { email: SEED.supplierOwnerEmail },
    update: { phone: SEED.supplierOwnerPhone, status: 'ACTIVE' },
    create: {
      email: SEED.supplierOwnerEmail,
      phone: SEED.supplierOwnerPhone,
      status: 'ACTIVE',
      roles: { create: [{ role: 'USER' }, { role: 'SUPPLIER' }] },
    },
  });
  await ensureUserRole(supplierOwner.id, 'USER');
  await ensureUserRole(supplierOwner.id, 'SUPPLIER');

  const supplier2Owner = await prisma.user.upsert({
    where: { email: SEED.secondSupplierEmail },
    update: { phone: SEED.secondSupplierPhone, status: 'ACTIVE' },
    create: {
      email: SEED.secondSupplierEmail,
      phone: SEED.secondSupplierPhone,
      status: 'ACTIVE',
      roles: { create: [{ role: 'USER' }, { role: 'SUPPLIER' }] },
    },
  });
  await ensureUserRole(supplier2Owner.id, 'USER');
  await ensureUserRole(supplier2Owner.id, 'SUPPLIER');

  const admin = await prisma.user.upsert({
    where: { email: SEED.adminEmail },
    update: { phone: SEED.adminPhone, status: 'ACTIVE' },
    create: {
      email: SEED.adminEmail,
      phone: SEED.adminPhone,
      status: 'ACTIVE',
      roles: { create: [{ role: 'ADMIN' }] },
    },
  });
  await ensureUserRole(admin.id, 'ADMIN');

  return { client, supplierOwner, supplier2Owner, admin };
}

async function pickTaxonomyRefs() {
  const mapping = await prisma.eventCategorySubcategoryMap.findFirst({
    orderBy: [{ priority: 'asc' }],
    include: {
      eventType: { select: { id: true, key: true } },
      category: { select: { id: true, key: true } },
      subcategory: { select: { id: true, key: true } },
    },
  });
  if (!mapping) {
    throw new Error('No event/category mapping found. Ensure event-taxonomy.json seeded correctly.');
  }
  return mapping;
}

async function seedSuppliersAndRelated(users: Awaited<ReturnType<typeof seedUsers>>) {
  const { supplierOwner, supplier2Owner } = users;
  const mapping = await pickTaxonomyRefs();

  const supplier1 = await prisma.supplier.upsert({
    where: { slug: SEED.supplierSlug },
    update: {
      ownerUserId: supplierOwner.id,
      businessName: 'Seed Catering Co.',
      description: 'Demo approved supplier for local events.',
      approvalStatus: 'APPROVED',
      isActive: true,
      isVerified: true,
      ratingAvg: new Prisma.Decimal('4.60'),
      ratingCount: 12,
    },
    create: {
      ownerUserId: supplierOwner.id,
      businessName: 'Seed Catering Co.',
      slug: SEED.supplierSlug,
      description: 'Demo approved supplier for local events.',
      approvalStatus: 'APPROVED',
      isActive: true,
      isVerified: true,
      ratingAvg: new Prisma.Decimal('4.60'),
      ratingCount: 12,
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { slug: SEED.supplier2Slug },
    update: {
      ownerUserId: supplier2Owner.id,
      businessName: 'Seed DJ Sounds',
      description: 'Demo supplier for music and lighting.',
      approvalStatus: 'PENDING',
      isActive: true,
      isVerified: false,
    },
    create: {
      ownerUserId: supplier2Owner.id,
      businessName: 'Seed DJ Sounds',
      slug: SEED.supplier2Slug,
      description: 'Demo supplier for music and lighting.',
      approvalStatus: 'PENDING',
      isActive: true,
      isVerified: false,
    },
  });

  const ensureSupplierCategory = async (supplierId: string) => {
    const existing = await prisma.supplierCategory.findFirst({
      where: { supplierId, categoryId: mapping.categoryId },
    });
    if (!existing) {
      await prisma.supplierCategory.create({
        data: {
          supplierId,
          categoryId: mapping.categoryId,
          subcategoryId: mapping.subcategoryId,
        },
      });
      return;
    }
    if (existing.subcategoryId !== mapping.subcategoryId) {
      await prisma.supplierCategory.update({
        where: { id: existing.id },
        data: { subcategoryId: mapping.subcategoryId },
      });
    }
  };

  await ensureSupplierCategory(supplier1.id);
  await ensureSupplierCategory(supplier2.id);

  await prisma.supplier.update({
    where: { id: supplier1.id },
    data: { serviceAreas: ['il-north', 'haifa'] },
  });

  const heroMedia = await prisma.supplierMedia.findFirst({
    where: { supplierId: supplier1.id, url: 'https://example.com/seed/catering-hero.jpg' },
  });
  if (!heroMedia) {
    await prisma.supplierMedia.create({
      data: {
        supplierId: supplier1.id,
        mediaType: 'IMAGE',
        url: 'https://example.com/seed/catering-hero.jpg',
        sortOrder: 0,
      },
    });
  }

  const instagram = await prisma.supplierSocialLink.findFirst({
    where: { supplierId: supplier1.id, platform: 'instagram' },
  });
  if (!instagram) {
    await prisma.supplierSocialLink.create({
      data: { supplierId: supplier1.id, platform: 'instagram', url: 'https://instagram.com/seedcatering' },
    });
  }

  await prisma.supplierAttribute.upsert({
    where: { supplierId: supplier1.id },
    update: { insurance: true, accessibility: true, languagesJson: ['he', 'en'] },
    create: {
      supplierId: supplier1.id,
      insurance: true,
      accessibility: true,
      languagesJson: ['he', 'en'],
    },
  });

  await prisma.supplierDraft.upsert({
    where: { supplierId: supplier1.id },
    update: {
      stepKey: 'media',
      completionPercent: 75,
      payloadJson: { notes: 'Seed draft payload' },
    },
    create: {
      supplierId: supplier1.id,
      stepKey: 'media',
      completionPercent: 75,
      payloadJson: { notes: 'Seed draft payload' },
    },
  });

  const historyExists = await prisma.supplierApprovalHistory.findFirst({
    where: { supplierId: supplier1.id, toStatus: 'APPROVED' },
  });
  if (!historyExists) {
    await prisma.supplierApprovalHistory.createMany({
      data: [
        {
          supplierId: supplier1.id,
          fromStatus: 'DRAFT',
          toStatus: 'PENDING',
          reason: 'Submitted for review',
        },
        {
          supplierId: supplier1.id,
          fromStatus: 'PENDING',
          toStatus: 'APPROVED',
          reason: 'Looks good',
          actorAdminId: users.admin.id,
        },
      ],
    });
  }

  const history2 = await prisma.supplierApprovalHistory.findFirst({
    where: { supplierId: supplier2.id },
  });
  if (!history2) {
    await prisma.supplierApprovalHistory.create({
      data: {
        supplierId: supplier2.id,
        fromStatus: 'DRAFT',
        toStatus: 'PENDING',
        reason: 'Awaiting review',
      },
    });
  }

  const s2media = await prisma.supplierMedia.findFirst({
    where: { supplierId: supplier2.id, url: 'https://example.com/seed/dj-cover.jpg' },
  });
  if (!s2media) {
    await prisma.supplierMedia.create({
      data: {
        supplierId: supplier2.id,
        mediaType: 'IMAGE',
        url: 'https://example.com/seed/dj-cover.jpg',
        sortOrder: 0,
      },
    });
  }

  const s2social = await prisma.supplierSocialLink.findFirst({
    where: { supplierId: supplier2.id, platform: 'website' },
  });
  if (!s2social) {
    await prisma.supplierSocialLink.create({
      data: { supplierId: supplier2.id, platform: 'website', url: 'https://example.com/seed-dj' },
    });
  }

  await prisma.supplierAttribute.upsert({
    where: { supplierId: supplier2.id },
    update: { insurance: false },
    create: { supplierId: supplier2.id, insurance: false },
  });

  await prisma.supplierDraft.upsert({
    where: { supplierId: supplier2.id },
    update: { stepKey: 'basics', completionPercent: 40, payloadJson: { seed: true } },
    create: {
      supplierId: supplier2.id,
      stepKey: 'basics',
      completionPercent: 40,
      payloadJson: { seed: true },
    },
  });

  await prisma.supplier.update({
    where: { id: supplier2.id },
    data: { serviceAreas: ['il-center', 'tlv'] },
  });

  const rejectedOwner = await prisma.user.upsert({
    where: { email: 'seed.rejected@example.com' },
    update: { phone: '0501111996', status: 'ACTIVE' },
    create: {
      email: 'seed.rejected@example.com',
      phone: '0501111996',
      status: 'ACTIVE',
      roles: { create: [{ role: 'USER' }, { role: 'SUPPLIER' }] },
    },
  });
  await ensureUserRole(rejectedOwner.id, 'USER');
  await ensureUserRole(rejectedOwner.id, 'SUPPLIER');

  const supplierRejected = await prisma.supplier.upsert({
    where: { slug: 'seed-rejected-co' },
    update: {
      ownerUserId: rejectedOwner.id,
      approvalStatus: 'REJECTED',
      isActive: false,
    },
    create: {
      ownerUserId: rejectedOwner.id,
      businessName: 'Seed Rejected Co',
      slug: 'seed-rejected-co',
      description: 'Demo supplier in REJECTED approval state.',
      approvalStatus: 'REJECTED',
      isActive: false,
    },
  });

  const rejHist = await prisma.supplierApprovalHistory.findFirst({
    where: { supplierId: supplierRejected.id, toStatus: 'REJECTED' },
  });
  if (!rejHist) {
    await prisma.supplierApprovalHistory.createMany({
      data: [
        {
          supplierId: supplierRejected.id,
          fromStatus: 'DRAFT',
          toStatus: 'PENDING',
          reason: 'Submitted',
        },
        {
          supplierId: supplierRejected.id,
          fromStatus: 'PENDING',
          toStatus: 'REJECTED',
          reason: 'Seed rejection',
          actorAdminId: users.admin.id,
        },
      ],
    });
  }

  return { supplier1, supplier2, mapping };
}

async function seedJobBoard(
  clientId: string,
  supplierId: string,
  supplierOwnerUserId: string,
  taxonomy: { eventTypeId: string; categoryId: string; subcategoryId: string },
) {
  let job = await prisma.jobPost.findFirst({
    where: { ownerUserId: clientId, title: '[Seed] Wedding catering tender' },
  });
  if (!job) {
    job = await prisma.jobPost.create({
      data: {
        ownerUserId: clientId,
        eventTypeId: taxonomy.eventTypeId,
        categoryId: taxonomy.categoryId,
        subcategoryId: taxonomy.subcategoryId,
        title: '[Seed] Wedding catering tender',
        description: 'Looking for kosher catering for ~120 guests in the north.',
        eventDate: new Date('2026-09-15T18:00:00.000Z'),
        locationText: 'Haifa area',
        budgetMin: 15000,
        budgetMax: 35000,
        guestCount: 120,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  } else {
    job = await prisma.jobPost.update({
      where: { id: job.id },
      data: {
        eventTypeId: taxonomy.eventTypeId,
        categoryId: taxonomy.categoryId,
        subcategoryId: taxonomy.subcategoryId,
        status: 'PUBLISHED',
        publishedAt: job.publishedAt ?? new Date(),
      },
    });
  }

  let application = await prisma.jobApplication.findUnique({
    where: { jobPostId_supplierId: { jobPostId: job.id, supplierId } },
  });
  if (!application) {
    application = await prisma.jobApplication.create({
      data: {
        jobPostId: job.id,
        supplierId,
        message: 'We can provide full service and tastings.',
        status: 'SUBMITTED',
      },
    });
    await prisma.jobApplicationHistory.create({
      data: {
        jobApplicationId: application.id,
        fromStatus: null,
        toStatus: 'SUBMITTED',
        actorType: 'supplier',
        actorId: supplierOwnerUserId,
      },
    });
  }

  const shortlistedHist = await prisma.jobApplicationHistory.findFirst({
    where: { jobApplicationId: application.id, toStatus: 'SHORTLISTED' },
  });
  if (!shortlistedHist) {
    await prisma.jobApplication.update({
      where: { id: application.id },
      data: { status: 'SHORTLISTED' },
    });
    await prisma.jobApplicationHistory.create({
      data: {
        jobApplicationId: application.id,
        fromStatus: 'SUBMITTED',
        toStatus: 'SHORTLISTED',
        actorType: 'user',
        actorId: clientId,
      },
    });
  }

  return { job, application };
}

async function seedCategoryScopedFilter(categoryId: string) {
  await prisma.filterDefinition.upsert({
    where: {
      scope_categoryId_key: { scope: 'CATEGORY', categoryId, key: 'seed_budget_tier' },
    },
    update: {
      label: 'Budget tier (seed)',
      type: 'SINGLE_SELECT',
      optionsJson: ['low', 'mid', 'high'],
      isActive: true,
      sortOrder: 1,
    },
    create: {
      scope: 'CATEGORY',
      categoryId,
      key: 'seed_budget_tier',
      label: 'Budget tier (seed)',
      type: 'SINGLE_SELECT',
      optionsJson: ['low', 'mid', 'high'],
      sortOrder: 1,
    },
  });
}

async function seedOtpArchiveRows() {
  const dummyHash = await hash('999999', 10);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const phoneRow = await prisma.otpRequest.findFirst({
    where: { phone: '0501111998', purpose: 'login', channel: 'PHONE' },
  });
  if (!phoneRow) {
    await prisma.otpRequest.create({
      data: {
        channel: 'PHONE',
        phone: '0501111998',
        email: null,
        purpose: 'login',
        codeHash: dummyHash,
        attempts: 0,
        maxAttempts: 5,
        expiresAt,
        verifiedAt: new Date(),
        consumedAt: new Date(),
      },
    });
  }

  const emailRow = await prisma.otpRequest.findFirst({
    where: { email: 'seed.otp.archive@example.com', channel: 'EMAIL', purpose: 'register' },
  });
  if (!emailRow) {
    await prisma.otpRequest.create({
      data: {
        channel: 'EMAIL',
        phone: null,
        email: 'seed.otp.archive@example.com',
        purpose: 'register',
        codeHash: dummyHash,
        attempts: 1,
        maxAttempts: 5,
        expiresAt,
        verifiedAt: null,
        consumedAt: new Date(),
      },
    });
  }
}

async function seedSecondaryJobFlow(
  clientId: string,
  supplier2Id: string,
  supplier2OwnerUserId: string,
  taxonomy: { eventTypeId: string; categoryId: string; subcategoryId: string },
) {
  let draftJob = await prisma.jobPost.findFirst({
    where: { ownerUserId: clientId, title: '[Seed] Draft corporate event' },
  });
  if (!draftJob) {
    draftJob = await prisma.jobPost.create({
      data: {
        ownerUserId: clientId,
        eventTypeId: taxonomy.eventTypeId,
        categoryId: taxonomy.categoryId,
        subcategoryId: taxonomy.subcategoryId,
        title: '[Seed] Draft corporate event',
        description: 'Draft job for seed data.',
        status: 'DRAFT',
      },
    });
  }

  let archivedJob = await prisma.jobPost.findFirst({
    where: { ownerUserId: clientId, title: '[Seed] Archived gala' },
  });
  if (!archivedJob) {
    archivedJob = await prisma.jobPost.create({
      data: {
        ownerUserId: clientId,
        eventTypeId: taxonomy.eventTypeId,
        categoryId: taxonomy.categoryId,
        subcategoryId: taxonomy.subcategoryId,
        title: '[Seed] Archived gala',
        description: 'Archived example.',
        status: 'ARCHIVED',
        publishedAt: new Date(Date.now() - 7 * 86400000),
      },
    });
  }

  let closedJob = await prisma.jobPost.findFirst({
    where: { ownerUserId: clientId, title: '[Seed] Closed kids party' },
  });
  if (!closedJob) {
    closedJob = await prisma.jobPost.create({
      data: {
        ownerUserId: clientId,
        eventTypeId: taxonomy.eventTypeId,
        categoryId: taxonomy.categoryId,
        subcategoryId: taxonomy.subcategoryId,
        title: '[Seed] Closed kids party',
        description: 'Closed job with withdrawn application.',
        status: 'CLOSED',
        publishedAt: new Date(Date.now() - 86400000),
      },
    });
  }

  let rejectedApp = await prisma.jobApplication.findUnique({
    where: { jobPostId_supplierId: { jobPostId: draftJob.id, supplierId: supplier2Id } },
  });
  if (!rejectedApp) {
    rejectedApp = await prisma.jobApplication.create({
      data: {
        jobPostId: draftJob.id,
        supplierId: supplier2Id,
        message: 'We can DJ this corporate event.',
        status: 'REJECTED',
      },
    });
    await prisma.jobApplicationHistory.createMany({
      data: [
        {
          jobApplicationId: rejectedApp.id,
          fromStatus: null,
          toStatus: 'SUBMITTED',
          actorType: 'supplier',
          actorId: supplier2OwnerUserId,
        },
        {
          jobApplicationId: rejectedApp.id,
          fromStatus: 'SUBMITTED',
          toStatus: 'REJECTED',
          reason: 'Not a fit for this draft job',
          actorType: 'user',
          actorId: clientId,
        },
      ],
    });
  }

  let withdrawnApp = await prisma.jobApplication.findUnique({
    where: { jobPostId_supplierId: { jobPostId: closedJob.id, supplierId: supplier2Id } },
  });
  if (!withdrawnApp) {
    withdrawnApp = await prisma.jobApplication.create({
      data: {
        jobPostId: closedJob.id,
        supplierId: supplier2Id,
        message: 'Interested then withdrawn.',
        status: 'WITHDRAWN',
      },
    });
    await prisma.jobApplicationHistory.createMany({
      data: [
        {
          jobApplicationId: withdrawnApp.id,
          fromStatus: null,
          toStatus: 'SUBMITTED',
          actorType: 'supplier',
          actorId: supplier2OwnerUserId,
        },
        {
          jobApplicationId: withdrawnApp.id,
          fromStatus: 'SUBMITTED',
          toStatus: 'WITHDRAWN',
          actorType: 'supplier',
          actorId: supplier2OwnerUserId,
        },
      ],
    });
  }
}

async function seedAnonymousAiExtras(anonymousSessionId: string, supplier1Id: string) {
  let anonConvo = await prisma.aiConversation.findFirst({
    where: { anonymousSessionId, status: 'GATED_REGISTRATION_REQUIRED' },
  });
  if (!anonConvo) {
    anonConvo = await prisma.aiConversation.create({
      data: {
        anonymousSessionId,
        status: 'GATED_REGISTRATION_REQUIRED',
        contextJson: { seed: true, gated: true },
      },
    });
  }

  const msgCount = await prisma.aiMessage.count({ where: { conversationId: anonConvo.id } });
  let asstMsgId: string;
  if (msgCount === 0) {
    const u = await prisma.aiMessage.create({
      data: { conversationId: anonConvo.id, role: 'USER', content: 'Anonymous planner question' },
    });
    const a = await prisma.aiMessage.create({
      data: { conversationId: anonConvo.id, role: 'ASSISTANT', content: 'Please register to continue.', latencyMs: 400 },
    });
    asstMsgId = a.id;
    void u;
  } else {
    const a = await prisma.aiMessage.findFirst({
      where: { conversationId: anonConvo.id, role: 'ASSISTANT' },
      orderBy: { createdAt: 'desc' },
    });
    asstMsgId = a!.id;
  }

  const failLog = await prisma.aiRecommendationLog.findFirst({
    where: { conversationId: anonConvo.id, failureTag: 'seed_no_supplier_match' },
  });
  if (!failLog) {
    await prisma.aiRecommendationLog.create({
      data: {
        conversationId: anonConvo.id,
        messageId: asstMsgId,
        supplierId: null,
        failureTag: 'seed_no_supplier_match',
        latencyMs: 50,
      },
    });
  }

  await prisma.aiUsageCounter.upsert({
    where: { anonymousSessionId },
    update: { messageCount: 3 },
    create: { anonymousSessionId, messageCount: 3 },
  });
}

async function seedReferralSupplierAttribution(supplier1Id: string, supplier2Id: string) {
  const link = await prisma.referralLink.findUnique({ where: { code: 'SEEDREF' } });
  if (!link) return;

  let attr = await prisma.referralAttribution.findFirst({
    where: { referralLinkId: link.id, referredSupplierId: supplier2Id },
  });
  if (!attr) {
    attr = await prisma.referralAttribution.create({
      data: {
        referralLinkId: link.id,
        referredSupplierId: supplier2Id,
        status: 'ATTRIBUTED',
      },
    });
  }

  const approvedReward = await prisma.referralReward.findFirst({
    where: { attributionId: attr.id, status: 'APPROVED' },
  });
  if (!approvedReward) {
    await prisma.referralReward.create({
      data: {
        supplierId: supplier1Id,
        attributionId: attr.id,
        status: 'APPROVED',
        amountCents: 10000,
        currency: 'ILS',
        approvedAt: new Date(),
      },
    });
  }

  const link2 = await prisma.referralLink.upsert({
    where: { code: 'SEEDREF2' },
    update: { supplierId: supplier2Id, url: 'https://example.com/r/SEEDREF2', isActive: true },
    create: {
      supplierId: supplier2Id,
      code: 'SEEDREF2',
      url: 'https://example.com/r/SEEDREF2',
      isActive: true,
    },
  });

  const attr2 = await prisma.referralAttribution.findFirst({
    where: { referralLinkId: link2.id, status: 'REJECTED' },
  });
  if (!attr2) {
    await prisma.referralAttribution.create({
      data: {
        referralLinkId: link2.id,
        status: 'REJECTED',
      },
    });
  }

  const paidOnSupplierRef = await prisma.referralReward.findFirst({
    where: { supplierId: supplier1Id, status: 'PAID' },
  });
  if (!paidOnSupplierRef && attr) {
    await prisma.referralReward.create({
      data: {
        supplierId: supplier1Id,
        attributionId: attr.id,
        status: 'PAID',
        amountCents: 2000,
        currency: 'ILS',
        paidAt: new Date(),
      },
    });
  }

  const rejectedReward = await prisma.referralReward.findFirst({
    where: { supplierId: supplier1Id, status: 'REJECTED' },
  });
  if (!rejectedReward && attr) {
    await prisma.referralReward.create({
      data: {
        supplierId: supplier1Id,
        attributionId: attr.id,
        status: 'REJECTED',
        amountCents: 500,
        currency: 'ILS',
      },
    });
  }
}

async function seedAllNotificationChannels(
  users: Awaited<ReturnType<typeof seedUsers>>,
  supplier1Id: string,
) {
  const base = { recipientUserId: users.client.id } as const;

  const pendingWelcome = await prisma.notification.findFirst({
    where: { recipientUserId: users.client.id, templateKey: 'user.welcome', status: 'PENDING' },
  });
  if (!pendingWelcome) {
    await prisma.notification.create({
      data: {
        ...base,
        channel: 'EMAIL',
        templateKey: 'user.welcome',
        payloadJson: { email: users.client.email },
        status: 'PENDING',
      },
    });
  }

  const pendingSms = await prisma.notification.findFirst({
    where: { recipientUserId: users.client.id, templateKey: 'seed.sms.reminder', status: 'PENDING' },
  });
  if (!pendingSms) {
    await prisma.notification.create({
      data: {
        ...base,
        channel: 'SMS',
        templateKey: 'seed.sms.reminder',
        payloadJson: { message: 'Seed pending SMS' },
        status: 'PENDING',
      },
    });
  }

  const sentEmail = await prisma.notification.findFirst({
    where: { recipientUserId: users.client.id, templateKey: 'user.welcome', status: 'SENT' },
  });
  if (!sentEmail) {
    await prisma.notification.create({
      data: {
        ...base,
        channel: 'EMAIL',
        templateKey: 'user.welcome',
        payloadJson: { email: users.client.email },
        status: 'SENT',
        sentAt: new Date(),
        providerMessageId: 'seed_smtp_001',
      },
    });
  }

  const failed = await prisma.notification.findFirst({
    where: { recipientUserId: users.client.id, templateKey: 'seed.sms.reminder', status: 'FAILED' },
  });
  if (!failed) {
    await prisma.notification.create({
      data: {
        ...base,
        channel: 'SMS',
        templateKey: 'seed.sms.reminder',
        payloadJson: { message: 'fail' },
        status: 'FAILED',
        errorCode: 'SEED_FORCE_FAIL',
      },
    });
  }

  const push = await prisma.notification.findFirst({
    where: { recipientUserId: users.client.id, templateKey: 'seed.push.alert' },
  });
  if (!push) {
    await prisma.notification.create({
      data: {
        ...base,
        channel: 'PUSH',
        templateKey: 'seed.push.alert',
        payloadJson: { title: 'Seed', body: 'Push notification body' },
        status: 'PENDING',
      },
    });
  }

  const supplierNotif = await prisma.notification.findFirst({
    where: { recipientSupplierId: supplier1Id, templateKey: 'supplier.onboarding.abandoned' },
  });
  if (!supplierNotif) {
    await prisma.notification.create({
      data: {
        recipientSupplierId: supplier1Id,
        channel: 'EMAIL',
        templateKey: 'supplier.onboarding.abandoned',
        payloadJson: { completionPercent: 10, stepKey: 'profile' },
        status: 'PENDING',
      },
    });
  }
}

async function seedNotificationPreferencesForAllUsers() {
  const rows = await prisma.user.findMany({ select: { id: true } });
  for (const { id } of rows) {
    await prisma.notificationPreference.upsert({
      where: { userId: id },
      update: {},
      create: {
        userId: id,
        emailEnabled: true,
        pushEnabled: true,
        mutedTemplatesJson: [],
      },
    });
  }
}

async function seedExtraPushTokens(users: Awaited<ReturnType<typeof seedUsers>>, supplier2Id: string) {
  await prisma.pushDeviceToken.upsert({
    where: { token: 'seed_fcm_supplier2_001' },
    update: { userId: users.supplier2Owner.id, supplierId: supplier2Id, isActive: true, platform: 'web' },
    create: {
      userId: users.supplier2Owner.id,
      supplierId: supplier2Id,
      token: 'seed_fcm_supplier2_001',
      platform: 'web',
    },
  });
}

async function seedAnonymousFavoritesAiReferrals(
  users: Awaited<ReturnType<typeof seedUsers>>,
  supplier1Id: string,
) {
  const anon = await prisma.anonymousSession.upsert({
    where: { token: SEED.anonToken },
    update: { fingerprintHash: 'seed_fp_hash' },
    create: { token: SEED.anonToken, fingerprintHash: 'seed_fp_hash', ipHash: 'seed_ip_hash' },
  });

  const favUser = await prisma.favoriteSupplier.findFirst({
    where: { userId: users.client.id, supplierId: supplier1Id },
  });
  if (!favUser) {
    await prisma.favoriteSupplier.create({
      data: { userId: users.client.id, supplierId: supplier1Id },
    });
  }

  const favAnon = await prisma.favoriteSupplier.findFirst({
    where: { anonymousSessionId: anon.id, supplierId: supplier1Id },
  });
  if (!favAnon) {
    await prisma.favoriteSupplier.create({
      data: { anonymousSessionId: anon.id, supplierId: supplier1Id },
    });
  }

  let convo = await prisma.aiConversation.findFirst({
    where: { userId: users.client.id, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
  if (!convo) {
    convo = await prisma.aiConversation.create({
      data: {
        userId: users.client.id,
        status: 'ACTIVE',
        contextJson: { seed: true, topic: 'wedding' },
      },
    });
  }

  const msgCount = await prisma.aiMessage.count({ where: { conversationId: convo.id } });
  let userMsg: { id: string };
  let asstMsg: { id: string };
  if (msgCount === 0) {
    userMsg = await prisma.aiMessage.create({
      data: { conversationId: convo.id, role: 'USER', content: 'Suggest caterers near Haifa.', tokenCount: 12 },
    });
    asstMsg = await prisma.aiMessage.create({
      data: {
        conversationId: convo.id,
        role: 'ASSISTANT',
        content: 'Here are a few options based on your preferences…',
        tokenCount: 80,
        latencyMs: 900,
      },
    });
  } else {
    let userRow = await prisma.aiMessage.findFirst({
      where: { conversationId: convo.id, role: 'USER' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    let asstRow = await prisma.aiMessage.findFirst({
      where: { conversationId: convo.id, role: 'ASSISTANT' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (!userRow) {
      userRow = await prisma.aiMessage.create({
        data: { conversationId: convo.id, role: 'USER', content: 'Suggest caterers near Haifa.', tokenCount: 12 },
        select: { id: true },
      });
    }
    if (!asstRow) {
      asstRow = await prisma.aiMessage.create({
        data: {
          conversationId: convo.id,
          role: 'ASSISTANT',
          content: 'Here are a few options based on your preferences…',
          tokenCount: 80,
          latencyMs: 900,
        },
        select: { id: true },
      });
    }
    userMsg = userRow;
    asstMsg = asstRow;
  }

  const logExists = await prisma.aiRecommendationLog.findFirst({
    where: { conversationId: convo.id, messageId: asstMsg.id, supplierId: supplier1Id },
  });
  if (!logExists) {
    await prisma.aiRecommendationLog.create({
      data: {
        conversationId: convo.id,
        messageId: asstMsg.id,
        supplierId: supplier1Id,
        score: new Prisma.Decimal('0.8721'),
        reasonsJson: { tags: ['kosher', 'north'] },
        latencyMs: 120,
      },
    });
  }

  await prisma.aiUsageCounter.upsert({
    where: { userId: users.client.id },
    update: { messageCount: 5 },
    create: { userId: users.client.id, messageCount: 5 },
  });

  const link = await prisma.referralLink.upsert({
    where: { code: 'SEEDREF' },
    update: { supplierId: supplier1Id, url: 'https://example.com/r/SEEDREF', isActive: true },
    create: {
      supplierId: supplier1Id,
      code: 'SEEDREF',
      url: 'https://example.com/r/SEEDREF',
      isActive: true,
    },
  });

  let attribution = await prisma.referralAttribution.findFirst({
    where: { referralLinkId: link.id, referredUserId: users.client.id },
  });
  if (!attribution) {
    attribution = await prisma.referralAttribution.create({
      data: {
        referralLinkId: link.id,
        referredUserId: users.client.id,
        status: 'QUALIFIED',
        completedAt: new Date(),
      },
    });
  }

  const rewardExists = await prisma.referralReward.findFirst({
    where: { attributionId: attribution.id },
  });
  if (!rewardExists) {
    await prisma.referralReward.create({
      data: {
        supplierId: supplier1Id,
        attributionId: attribution.id,
        status: 'PENDING',
        amountCents: 5000,
        currency: 'ILS',
      },
    });
  }

  const shareExists = await prisma.supplierShareEvent.findFirst({
    where: { supplierId: supplier1Id, userId: users.client.id, channel: 'whatsapp' },
  });
  if (!shareExists) {
    await prisma.supplierShareEvent.create({
      data: {
        supplierId: supplier1Id,
        userId: users.client.id,
        channel: 'whatsapp',
        context: 'seed_share',
      },
    });
  }

  const shareAnon = await prisma.supplierShareEvent.findFirst({
    where: { supplierId: supplier1Id, anonymousSessionId: anon.id, channel: 'copy_link' },
  });
  if (!shareAnon) {
    await prisma.supplierShareEvent.create({
      data: {
        supplierId: supplier1Id,
        anonymousSessionId: anon.id,
        channel: 'copy_link',
        context: 'seed_anon_share',
      },
    });
  }

  await seedAnonymousAiExtras(anon.id, supplier1Id);

  const closedConvo = await prisma.aiConversation.findFirst({
    where: { userId: users.client.id, status: 'CLOSED' },
  });
  if (!closedConvo) {
    const c = await prisma.aiConversation.create({
      data: {
        userId: users.client.id,
        status: 'CLOSED',
        contextJson: { seed: true },
      },
    });
    await prisma.aiMessage.create({
      data: { conversationId: c.id, role: 'SYSTEM', content: 'Conversation closed (seed).' },
    });
  }
}

async function seedNotificationsAndPush(users: Awaited<ReturnType<typeof seedUsers>>, supplier1Id: string) {
  await prisma.pushDeviceToken.upsert({
    where: { token: 'seed_fcm_client_001' },
    update: { userId: users.client.id, isActive: true, platform: 'ios' },
    create: { userId: users.client.id, token: 'seed_fcm_client_001', platform: 'ios' },
  });

  await prisma.pushDeviceToken.upsert({
    where: { token: 'seed_fcm_supplier_001' },
    update: { supplierId: supplier1Id, isActive: true, platform: 'android' },
    create: { supplierId: supplier1Id, token: 'seed_fcm_supplier_001', platform: 'android' },
  });
}

async function seedDemoSupplierReview(clientUserId: string, supplierId: string) {
  const existing = await prisma.supplierReview.findFirst({
    where: { supplierId, authorUserId: clientUserId },
  });
  if (existing) {
    return;
  }
  await prisma.supplierReview.create({
    data: {
      supplierId,
      authorUserId: clientUserId,
      rating: 5,
      title: 'Seed review',
      comment: 'Great experience (demo data).',
    },
  });
  const agg = await prisma.supplierReview.aggregate({
    where: { supplierId },
    _avg: { rating: true },
    _count: { id: true },
  });
  await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      ratingCount: agg._count.id,
      ratingAvg:
        agg._count.id > 0 && agg._avg.rating != null
          ? new Prisma.Decimal(Number(agg._avg.rating).toFixed(2))
          : null,
    },
  });
}

async function main() {
  console.log('Seeding taxonomy, filters, templates…');
  await seedTaxonomyAndFilters();

  console.log('Seeding users…');
  const users = await seedUsers();

  console.log('Seeding edge-case users (inactive/blocked)…');
  await seedEdgeCaseUsers();

  console.log('Seeding suppliers and related records…');
  const { supplier1, supplier2, mapping } = await seedSuppliersAndRelated(users);

  console.log('Seeding category-scoped filter…');
  await seedCategoryScopedFilter(mapping.categoryId);

  console.log('Seeding OTP archive rows…');
  await seedOtpArchiveRows();

  console.log('Seeding job board…');
  await seedJobBoard(users.client.id, supplier1.id, users.supplierOwner.id, {
    eventTypeId: mapping.eventTypeId,
    categoryId: mapping.categoryId,
    subcategoryId: mapping.subcategoryId,
  });

  console.log('Seeding saved event concepts for demo client…');
  await seedSavedConcepts(users.client.id);

  console.log('Seeding secondary jobs and applications…');
  await seedSecondaryJobFlow(users.client.id, supplier2.id, users.supplier2Owner.id, {
    eventTypeId: mapping.eventTypeId,
    categoryId: mapping.categoryId,
    subcategoryId: mapping.subcategoryId,
  });

  console.log('Seeding demo supplier review…');
  await seedDemoSupplierReview(users.client.id, supplier1.id);

  console.log('Seeding anonymous session, favorites, AI, referrals, share events…');
  await seedAnonymousFavoritesAiReferrals(users, supplier1.id);

  console.log('Seeding supplier-referred-supplier attribution…');
  await seedReferralSupplierAttribution(supplier1.id, supplier2.id);

  console.log('Seeding notification preferences (all users)…');
  await seedNotificationPreferencesForAllUsers();

  console.log('Seeding notifications (all channels + statuses)…');
  await seedAllNotificationChannels(users, supplier1.id);

  console.log('Seeding push tokens…');
  await seedNotificationsAndPush(users, supplier1.id);
  await seedExtraPushTokens(users, supplier2.id);

  console.log('Seed completed.');
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
