-- Add mapping table for eventType -> category -> subcategory filters.
CREATE TABLE IF NOT EXISTS "EventCategorySubcategoryMap" (
  "id" TEXT NOT NULL,
  "eventTypeId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "subcategoryId" TEXT NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EventCategorySubcategoryMap_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EventCategorySubcategoryMap_eventTypeId_categoryId_subcategoryId_key"
ON "EventCategorySubcategoryMap"("eventTypeId", "categoryId", "subcategoryId");

CREATE INDEX IF NOT EXISTS "EventCategorySubcategoryMap_eventTypeId_categoryId_idx"
ON "EventCategorySubcategoryMap"("eventTypeId", "categoryId");

ALTER TABLE "EventCategorySubcategoryMap"
ADD CONSTRAINT "EventCategorySubcategoryMap_eventTypeId_fkey"
FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventCategorySubcategoryMap"
ADD CONSTRAINT "EventCategorySubcategoryMap_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventCategorySubcategoryMap"
ADD CONSTRAINT "EventCategorySubcategoryMap_subcategoryId_fkey"
FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
