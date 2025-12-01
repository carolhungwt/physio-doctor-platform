import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { CreatePhysioProfileDto } from './dto/create-physio-profile.dto';
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

    // Check if license number exists in doctor profiles
    const existingDoctorLicense = await this.prisma.doctorProfile.findFirst({
      where: { licenseNumber: dto.licenseNumber }
    });

    if (existingDoctorLicense) {
      throw new ConflictException('This license number is already registered to another doctor');
    }

    // Cross-check with physio profiles
    const existingPhysioLicense = await this.prisma.physioProfile.findFirst({
      where: { licenseNo: dto.licenseNumber }
    });

    if (existingPhysioLicense) {
      throw new ConflictException('This license number is already registered to a physiotherapist');
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

  async updateDoctorProfile(userId: string, dto: CreateDoctorProfileDto) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new NotFoundException('Doctor profile not found');
    }

    // Check if license number is being changed and if it's already taken
    if (dto.licenseNumber !== profile.licenseNumber) {
      // Check doctor profiles
      const existingDoctorLicense = await this.prisma.doctorProfile.findFirst({
        where: { 
          licenseNumber: dto.licenseNumber,
          userId: { not: userId }
        }
      });

      if (existingDoctorLicense) {
        throw new ConflictException('This license number is already registered to another doctor');
      }

      // Cross-check with physio profiles
      const existingPhysioLicense = await this.prisma.physioProfile.findFirst({
        where: { licenseNo: dto.licenseNumber }
      });

      if (existingPhysioLicense) {
        throw new ConflictException('This license number is already registered to a physiotherapist');
      }
    }

    const updatedProfile = await this.prisma.doctorProfile.update({
      where: { userId },
      data: {
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
        country: dto.country
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

    return updatedProfile;
  }

  // Physiotherapist Profile Methods
  async createPhysioProfile(userId: string, dto: CreatePhysioProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { physioProfile: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.PHYSIO) {
      throw new ConflictException('User is not registered as a physiotherapist');
    }

    if (user.physioProfile) {
      throw new ConflictException('Physiotherapist profile already exists');
    }

    // Check if license number exists in physio profiles
    const existingPhysioLicense = await this.prisma.physioProfile.findFirst({
      where: { licenseNo: dto.licenseNo }
    });

    if (existingPhysioLicense) {
      throw new ConflictException('This license number is already registered to another physiotherapist');
    }

    // Cross-check with doctor profiles
    const existingDoctorLicense = await this.prisma.doctorProfile.findFirst({
      where: { licenseNumber: dto.licenseNo }
    });

    if (existingDoctorLicense) {
      throw new ConflictException('This license number is already registered to a doctor');
    }

    const physioProfile = await this.prisma.physioProfile.create({
      data: {
        userId,
        licenseNo: dto.licenseNo,
        specialties: dto.specialties,
        offersClinicService: dto.offersClinicService,
        offersHomeService: dto.offersHomeService,
        clinicAddress: dto.clinicAddress,
        serviceRadius: dto.serviceRadius,
        serviceDistricts: dto.serviceDistricts || [],
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        accountName: dto.accountName,
        isLicenseVerified: false
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

    // Create service offerings separately
    if (dto.services && dto.services.length > 0) {
      await this.prisma.service.createMany({
        data: dto.services.map(service => ({
          providerId: userId,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          serviceType: service.serviceType as any
        }))
      });
    }

    return physioProfile;
  }

  async getPhysioProfile(userId: string) {
    const profile = await this.prisma.physioProfile.findUnique({
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
      throw new NotFoundException('Physiotherapist profile not found');
    }

    // Fetch services separately
    const services = await this.prisma.service.findMany({
      where: { providerId: userId },
      orderBy: { createdAt: 'asc' }
    });

    return {
      ...profile,
      services
    };
  }

  async updatePhysioProfile(userId: string, dto: CreatePhysioProfileDto) {
    const profile = await this.prisma.physioProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new NotFoundException('Physiotherapist profile not found');
    }

    // Check if license number is being changed and if it's already taken
    if (dto.licenseNo !== profile.licenseNo) {
      // Check physio profiles
      const existingPhysioLicense = await this.prisma.physioProfile.findFirst({
        where: { 
          licenseNo: dto.licenseNo,
          userId: { not: userId }
        }
      });

      if (existingPhysioLicense) {
        throw new ConflictException('This license number is already registered to another physiotherapist');
      }

      // Cross-check with doctor profiles
      const existingDoctorLicense = await this.prisma.doctorProfile.findFirst({
        where: { licenseNumber: dto.licenseNo }
      });

      if (existingDoctorLicense) {
        throw new ConflictException('This license number is already registered to a doctor');
      }
    }

    const updatedProfile = await this.prisma.physioProfile.update({
      where: { userId },
      data: {
        licenseNo: dto.licenseNo,
        specialties: dto.specialties,
        offersClinicService: dto.offersClinicService,
        offersHomeService: dto.offersHomeService,
        clinicAddress: dto.clinicAddress,
        serviceRadius: dto.serviceRadius,
        serviceDistricts: dto.serviceDistricts || [],
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        accountName: dto.accountName
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

    // Update services if provided
    if (dto.services) {
      // Delete existing services
      await this.prisma.service.deleteMany({
        where: { providerId: userId }
      });

      // Create new services
      if (dto.services.length > 0) {
        await this.prisma.service.createMany({
          data: dto.services.map(service => ({
            providerId: userId,
            name: service.name,
            description: service.description,
            duration: service.duration,
            price: service.price,
            serviceType: service.serviceType as any
          }))
        });
      }
    }

    return updatedProfile;
  }
}