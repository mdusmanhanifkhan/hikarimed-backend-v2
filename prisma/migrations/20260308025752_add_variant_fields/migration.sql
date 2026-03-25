-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "consumable" BOOLEAN,
ADD COLUMN     "ivOrInjection" BOOLEAN,
ADD COLUMN     "packQuantity" INTEGER,
ADD COLUMN     "requiresColdStorage" BOOLEAN,
ADD COLUMN     "sizeOrType" TEXT;
