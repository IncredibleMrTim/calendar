/*
  Warnings:

  - You are about to drop the column `contactDetailsId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `ContactDetails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_contactDetailsId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "contactDetailsId",
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactFirstName" TEXT,
ADD COLUMN     "contactLastName" TEXT,
ADD COLUMN     "contactPhone" TEXT;

-- DropTable
DROP TABLE "ContactDetails";
