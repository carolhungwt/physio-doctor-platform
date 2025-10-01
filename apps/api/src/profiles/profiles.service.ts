import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UserRole, Gender } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  // Patient Profile Methods
  async createPatientProfile(userId: string, profileData: {
    dateOfBirth?: string;
    gender?: Gender;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    medicalHistory?: string;
    allergies?: string;
    currentMedications?: string;
  }) {
    return this.prisma.patientProfile.create({
      data: {
        userId,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : null,
        gender: profileData.gender || null,
        emergencyContactName: profileData.emergencyContactName || null,
        emergencyContactPhone: profileData.emergencyContactPhone || null,
        medicalHistory: profileData.medicalHistory || null,
        allergies: profileData.allergies || null,
        currentMedications: profileData.currentMedications || null,
      },
    });
  }

  async getPatientProfile(userId: string) {
    return this.prisma.patientProfile.findUnique({
      where: { userId },
    });
  }

  async updatePatientProfile(userId: string, profileData: any) {
    return this.prisma.patientProfile.update({
      where: { userId },
      data: {
        ...profileData,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
      },
    });
  }

  // Doctor Profile Methods
  async createDoctorProfile(userId: string, dto: CreateDoctorProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.DOCTOR) {
      throw new ConflictException('User is not registered as a doctor');
    }

    if (user.doctorProfile) {
      throw new ConflictException('Doctor profile already exists');
    }

    const existingLicense = await this.prisma.doctorProfile.findFirst({
      where: { licenseNumber: dto.licenseNumber }
    });

    if (existingLicense) {
      throw new ConflictException('This license number is already registered');
    }

    const doctorProfile = await this.prisma.doctorProfile.create({
      data: {
        userId,
        licenseNumber: dto.licenseNumber,
        specialties: dto.specialties,
        yearsOfExperience: dto.yearsOfExperience,
        bio: dto.bio,
        consultationFee: dto.consultationFee,
        consultationType: dto.consultationType,
        acceptsReferrals: dto.acceptsReferrals,
        hospitalAffiliations: dto.hospitalAffiliations || [],
        bankName: dto.bankName,
        bankAccountNumber: dto.bankAccountNumber,
        bankAccountName: dto.bankAccountName,
        clinicName: dto.clinicName,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        district: dto.district,
        country: dto.country,
        isVerified: false,
        verificationStatus: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true
          }
        }
      }
    });

    return doctorProfile;
  }

  async getDoctorProfile(userId: string) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true
          }
        }
      }
    });

    if (!profile) {
      throw new NotFoundException('Doctor profile not found');
    }

    return profile;
  }
}