import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async getAllPatients(search?: string) {
    const where: any = {
      role: UserRole.PATIENT,
      isActive: true
    };

    // If search query provided, search by name, email, or phone
    if (search && search.trim()) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        patientProfile: {
          select: {
            dateOfBirth: true,
            gender: true
          }
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });
  }

  async getPatientWithProfile(patientId: string) {
    return this.prisma.user.findUnique({
      where: { id: patientId },
      include: {
        patientProfile: true
      }
    });
  }
}

