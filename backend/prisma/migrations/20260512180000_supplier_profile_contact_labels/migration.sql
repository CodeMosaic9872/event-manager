-- Public profile contact / location fields
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "contact_email" TEXT;
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "public_phone" TEXT;
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "whatsapp_url" TEXT;
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "website_url" TEXT;
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "extra_language" TEXT;

-- Profile label lists (JSON string arrays)
ALTER TABLE "SupplierAttribute" ADD COLUMN IF NOT EXISTS "labels_rules_json" JSONB;
ALTER TABLE "SupplierAttribute" ADD COLUMN IF NOT EXISTS "labels_niche_json" JSONB;

-- Optional FK from SupplierCategory to Subcategory (nullable subcategoryId)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SupplierCategory_subcategoryId_fkey'
  ) THEN
    ALTER TABLE "SupplierCategory"
      ADD CONSTRAINT "SupplierCategory_subcategoryId_fkey"
      FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
