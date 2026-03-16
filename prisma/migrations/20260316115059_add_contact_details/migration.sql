-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "contactDetailsId" TEXT;

-- CreateTable
CREATE TABLE "ContactDetails" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "ContactDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_contactDetailsId_fkey" FOREIGN KEY ("contactDetailsId") REFERENCES "ContactDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;
