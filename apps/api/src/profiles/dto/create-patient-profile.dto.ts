import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreatePatientProfileDto {
    @IsOptional()
    @IsString()
    dateOfBirth?: string;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    emergencyContactName?: string;

    @IsOptional()
    @IsString()
    emergencyContactPhone?: string;

    @IsOptional()
    @IsString()
    medicalHistory?: string;

    @IsOptional()
    @IsString()
    allergies?: string;

    @IsOptional()
    @IsString()
    currentMedications?: string;
}