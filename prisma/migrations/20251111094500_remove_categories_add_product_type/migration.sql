-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('FUND', 'PARTNER_UP');

-- Drop indexes that reference the old category column
DROP INDEX IF EXISTS "products_categoryId_isActive_idx";
DROP INDEX IF EXISTS "products_isActive_categoryId_createdAt_idx";

-- Remove foreign key constraint to categories
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_categoryId_fkey";

-- Add new product type columns
ALTER TABLE "products"
    ADD COLUMN "type" "ProductType" NOT NULL DEFAULT 'FUND',
    ADD COLUMN "funding_goal_amount" INTEGER,
    ADD COLUMN "funding_current_amount" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "funding_supporter_count" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "funding_deadline" TIMESTAMP(3);

-- Remove legacy category column
ALTER TABLE "products" DROP COLUMN IF EXISTS "categoryId";

-- Drop legacy categories table
DROP TABLE IF EXISTS "categories";

-- Create new indexes for product type filtering
CREATE INDEX "products_type_isActive_createdAt_idx" ON "products"("type", "isActive", "createdAt");

