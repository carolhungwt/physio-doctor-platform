import { IsString, IsInt, IsEnum, IsOptional, IsUUID, Min } from 'class-validator';
import { Urgency, ServiceType } from '@prisma/client';

export class CreateReferralDto {
  @IsUUID()
  patientId: string;

  @IsString()
  diagnosis: string;

  @IsInt()
  @Min(1)
  sessions: number;

  @IsEnum(Urgency)
  @IsOptional()
  urgency?: Urgency;

  @IsEnum(ServiceType)
  @IsOptional()
  serviceType?: ServiceType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  validityDays?: number; // How many days the referral is valid for (default: 90)
}

