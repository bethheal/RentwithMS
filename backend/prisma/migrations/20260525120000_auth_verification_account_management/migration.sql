-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'pending_verification', 'deactivated', 'deleted');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "phoneNumber" TEXT,
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "verificationCode" TEXT,
ADD COLUMN "verificationToken" TEXT,
ADD COLUMN "verificationCodeExpiry" TIMESTAMP(3),
ADD COLUMN "verificationTokenExpiry" TIMESTAMP(3),
ADD COLUMN "verificationAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "resendAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastVerificationSentAt" TIMESTAMP(3),
ADD COLUMN "verificationMethod" TEXT,
ADD COLUMN "accountStatus" "AccountStatus" NOT NULL DEFAULT 'active',
ADD COLUMN "deactivatedAt" TIMESTAMP(3),
ADD COLUMN "scheduledDeletionDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_accountStatus_idx" ON "User"("accountStatus");

-- CreateIndex
CREATE INDEX "User_verificationToken_idx" ON "User"("verificationToken");

-- CreateIndex
CREATE INDEX "User_scheduledDeletionDate_idx" ON "User"("scheduledDeletionDate");
