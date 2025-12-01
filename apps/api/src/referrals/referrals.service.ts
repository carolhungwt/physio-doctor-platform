import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UserRole, Urgency } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async createReferral(doctorId: string, dto: any) {
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

    // Verify physiotherapist exists
    if (!dto.physioId) {
      throw new BadRequestException('Physiotherapist selection is required');
    }

    const physio = await this.prisma.user.findUnique({
      where: { id: dto.physioId },
      include: { physioProfile: true }
    });

    if (!physio || physio.role !== UserRole.PHYSIO) {
      throw new NotFoundException('Physiotherapist not found');
    }

    // Handle patient - either existing or create new
    let patientId: string;

    if (dto.patientId) {
      // Verify existing patient
      const patient = await this.prisma.user.findUnique({
        where: { id: dto.patientId },
        include: { patientProfile: true }
      });

      if (!patient || patient.role !== UserRole.PATIENT) {
        throw new NotFoundException('Patient not found');
      }

      patientId = patient.id;
    } else if (dto.newPatient) {
      // Create new patient
      const { firstName, lastName, email, phone } = dto.newPatient;

      // Validate: at least email or phone must be provided
      if (!email && !phone) {
        throw new BadRequestException('Either email or phone number must be provided for new patient');
      }

      // Check if patient with this email or phone already exists
      let existingUser = null;
      
      if (email) {
        existingUser = await this.prisma.user.findUnique({
          where: { email }
        });
      }
      
      if (!existingUser && phone) {
        existingUser = await this.prisma.user.findUnique({
          where: { phone }
        });
      }

      if (existingUser) {
        if (existingUser.role === UserRole.PATIENT) {
          // Use existing patient
          patientId = existingUser.id;
        } else {
          throw new ConflictException('A user with this contact information already exists with a different role');
        }
      } else {
        // Create new patient user and profile
        const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
        const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(tempPassword, bcryptRounds);

        // Generate email if not provided (for system purposes)
        const systemEmail = email || `patient_${phone?.replace(/\D/g, '')}@temp.physio-platform.hk`;
        const username = email 
          ? email.split('@')[0] + Math.random().toString(36).slice(-4)
          : `patient_${Date.now()}`;

        const newPatient = await this.prisma.user.create({
          data: {
            email: systemEmail,
            username: username,
            hashedPassword,
            firstName,
            lastName,
            phone: phone || null,
            role: UserRole.PATIENT,
            isVerified: false,
            patientProfile: {
              create: {}
            }
          }
        });

        patientId = newPatient.id;

        // TODO: Send email/SMS to patient with account details and password reset link
        // If email provided: send email
        // If only phone provided: send SMS
      }
    } else {
      throw new BadRequestException('Either patientId or newPatient data must be provided');
    }

    // Calculate expiry date (default 90 days)
    const validityDays = dto.validityDays || 90;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validityDays);

    // Create the referral
    const referral = await this.prisma.referral.create({
      data: {
        patientId: patientId,
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

