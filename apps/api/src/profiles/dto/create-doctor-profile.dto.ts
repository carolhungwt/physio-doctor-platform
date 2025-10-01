// apps/api/src/profiles/dto/create-doctor-profile.dto.ts

import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsEnum, Min } from 'class-validator';

export enum ConsultationType {
    VIDEO = 'VIDEO',
    IN_PERSON = 'IN_PERSON',
    BOTH = 'BOTH'
}

export class CreateDoctorProfileDto {
    @IsString()
    licenseNumber: string;

    @IsArray()
    @IsString({ each: true })
    specialties: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    yearsOfExperience?: number;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsNumber()
    @Min(0)
    consultationFee: number;

    @IsEnum(ConsultationType)
    consultationType: ConsultationType;

    @IsBoolean()
    acceptsReferrals: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    hospitalAffiliations?: string[];

    // Banking details
    @IsOptional()
    @IsString()
    bankName?: string;

    @IsOptional()
    @IsString()
    bankAccountNumber?: string;

    @IsOptional()
    @IsString()
    bankAccountName?: string;

    // Address
    @IsOptional()
    @IsString()
    clinicName?: string;

    @IsOptional()
    @IsString()
    addressLine1?: string;

    @IsOptional()
    @IsString()
    addressLine2?: string;

    @IsString()
    city: string;

    @IsOptional()
    @IsString()
    district?: string;

    @IsString()
    country: string;
}