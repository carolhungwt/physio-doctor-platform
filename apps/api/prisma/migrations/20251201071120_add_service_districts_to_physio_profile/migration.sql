-- AlterTable
ALTER TABLE "physio_profiles" ADD COLUMN     "serviceDistricts" TEXT[] DEFAULT ARRAY[]::TEXT[];
