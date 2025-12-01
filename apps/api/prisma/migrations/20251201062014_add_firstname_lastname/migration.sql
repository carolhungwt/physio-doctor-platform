/*
  Warnings:

  - You are about to drop the column `address` on the `patient_profiles` table. All the data in the column will be lost.
  - The `allergies` column on the `patient_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currentMedications` column on the `patient_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `doctor_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "doctor_profiles" DROP CONSTRAINT "doctor_profiles_userId_fkey";

-- AlterTable
ALTER TABLE "patient_profiles" DROP COLUMN "address",
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Hong Kong',
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "hasAllergies" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneCountryCode" TEXT NOT NULL DEFAULT '+852',
ADD COLUMN     "postalCode" TEXT,
DROP COLUMN "allergies",
ADD COLUMN     "allergies" JSONB,
DROP COLUMN "currentMedications",
ADD COLUMN     "currentMedications" JSONB;

-- AlterTable
ALTER TABLE "referrals" ADD COLUMN     "doctorProfileId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- DropTable
DROP TABLE "doctor_profiles";

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseDocument" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "specialties" TEXT[],
    "yearsOfExperience" INTEGER,
    "bio" TEXT,
    "hospitalAffiliations" TEXT[],
    "consultationFee" DECIMAL(10,2) NOT NULL,
    "consultationType" TEXT NOT NULL,
    "acceptsReferrals" BOOLEAN NOT NULL DEFAULT true,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountName" TEXT,
    "clinicName" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Hong Kong',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_licenseNumber_key" ON "DoctorProfile"("licenseNumber");

-- CreateIndex
CREATE INDEX "DoctorProfile_licenseNumber_idx" ON "DoctorProfile"("licenseNumber");

-- CreateIndex
CREATE INDEX "DoctorProfile_userId_idx" ON "DoctorProfile"("userId");

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
