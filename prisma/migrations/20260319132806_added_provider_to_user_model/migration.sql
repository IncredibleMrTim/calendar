-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'MANUAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provider" "AuthProvider";
