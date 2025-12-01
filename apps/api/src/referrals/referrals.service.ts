import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UserRole, Urgency } from '@prisma/client';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async createReferral(doctorId: string, dto: CreateReferralDto) {
    // Verify doctor exists and has a profile
    const doctor = await this.prisma.user.findUnique({
      where: { id: doctorId },
      include: { doctorProfile: true }
    });

    if (!doctor || doctor.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Only doctors can create referrals');
    }

    if (!doctor.doctorProfile) {
      throw new ConflictException('Doctor profile not completed. Please complete your profile to create referrals.');
    }

    // Validate required profile fields
    const profile = doctor.doctorProfile;
    const missingFields: string[] = [];

    if (!profile.licenseNumber) missingFields.push('Medical license number');
    if (!profile.specialties || profile.specialties.length === 0) missingFields.push('Specialties');
    if (!profile.consultationFee) missingFields.push('Consultation fee');
    if (!profile.bankName || !profile.bankAccountNumber || !profile.bankAccountName) {
      missingFields.push('Banking details (required for referral fees)');
    }

    if (missingFields.length > 0) {
      throw new ConflictException(
        `Profile incomplete. Missing required fields: ${missingFields.join(', ')}`
      );
    }

    // Verify patient exists
    const patient = await this.prisma.user.findUnique({
      where: { id: dto.patientId },
      include: { patientProfile: true }
    });

    if (!patient || patient.role !== UserRole.PATIENT) {
      throw new NotFoundException('Patient not found');
    }

    if (!patient.patientProfile) {
      throw new ConflictException('Patient profile not found');
    }

    // Calculate expiry date (default 90 days)
    const validityDays = dto.validityDays || 90;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validityDays);

    // Create the referral
    const referral = await this.prisma.referral.create({
      data: {
        patientId: dto.patientId,
        doctorId: doctorId,
        diagnosis: dto.diagnosis,
        sessions: dto.sessions,
        urgency: dto.urgency || Urgency.ROUTINE,
        serviceType: dto.serviceType || null,
        notes: dto.notes || null,
        expiryDate: expiryDate,
        status: 'ACTIVE',
        sessionsUsed: 0
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            doctorProfile: {
              select: {
                specialties: true,
                licenseNumber: true
              }
            }
          }
        }
      }
    });

    // TODO: Generate PDF and QR code
    // TODO: Send notification to patient

    return referral;
  }

  async getReferralsByDoctor(doctorId: string) {
    return this.prisma.referral.findMany({
      where: { doctorId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getReferralsByPatient(patientId: string) {
    return this.prisma.referral.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            doctorProfile: {
              select: {
                specialties: true,
                licenseNumber: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getReferralById(referralId: string, userId: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { id: referralId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            patientProfile: true
          }
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            doctorProfile: {
              select: {
                specialties: true,
                licenseNumber: true,
                clinicName: true,
                addressLine1: true,
                city: true
              }
            }
          }
        },
        appointments: {
          select: {
            id: true,
            scheduledStart: true,
            status: true,
            physio: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    // Verify access - only doctor, patient, or physio with appointment can view
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (
      referral.doctorId !== userId &&
      referral.patientId !== userId &&
      user?.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Access denied');
    }

    return referral;
  }

  async updateReferralStatus(referralId: string, doctorId: string, status: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { id: referralId }
    });

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    if (referral.doctorId !== doctorId) {
      throw new ForbiddenException('Only the issuing doctor can update this referral');
    }

    return this.prisma.referral.update({
      where: { id: referralId },
      data: { status: status as any }
    });
  }

  async getActiveReferralsForPatient(patientId: string) {
    return this.prisma.referral.findMany({
      where: {
        patientId,
        status: 'ACTIVE',
        expiryDate: {
          gte: new Date()
        }
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            doctorProfile: {
              select: {
                specialties: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

