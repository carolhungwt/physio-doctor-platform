import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: {
    email: string;
    username: string;
    password: string;
    phone?: string;
    role: UserRole;
  }): Promise<User> {
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      bcryptRounds,
    );

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        username: createUserDto.username,
        hashedPassword,
        phone: createUserDto.phone,
        role: createUserDto.role,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        doctorProfile: true,
        physioProfile: true,
        patientProfile: true,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        doctorProfile: true,
        physioProfile: true,
        patientProfile: true,
      },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      include: {
        doctorProfile: true,
        physioProfile: true,
        patientProfile: true,
      },
    });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    // Try email first
    let user = await this.findByEmail(identifier);
    if (user) return user;

    // Try username
    user = await this.findByUsername(identifier);
    if (user) return user;

    // Try phone (if it starts with +)
    if (identifier.startsWith('+')) {
      user = await this.findByPhone(identifier);
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        doctorProfile: true,
        physioProfile: true,
        patientProfile: true,
      },
    });
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async verifyUser(id: string): Promise<User> {
    return this.updateUser(id, { isVerified: true });
  }
}
