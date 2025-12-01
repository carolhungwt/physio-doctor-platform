// apps/api/src/profiles/dto/create-physio-profile.dto.ts

import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceOfferingDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0)
    duration: number; // in minutes

    @IsNumber()
    @Min(0)
    price: number; // in HKD

    @IsString()
    serviceType: 'CLINIC' | 'HOME_VISIT' | 'BOTH';
}

export class CreatePhysioProfileDto {
    @IsString()
    licenseNo: string;

    @IsArray()
    @IsString({ each: true })
    specialties: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ServiceOfferingDto)
    services: ServiceOfferingDto[];

    @IsBoolean()
    offersClinicService: boolean;

    @IsBoolean()
    offersHomeService: boolean;

    @IsOptional()
    @IsString()
    clinicAddress?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    serviceRadius?: number; // in km for home visits

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    serviceDistricts?: string[]; // Hong Kong districts covered for home visits

    // Banking details
    @IsOptional()
    @IsString()
    bankName?: string;

    @IsOptional()
    @IsString()
    accountNumber?: string;

    @IsOptional()
    @IsString()
    accountName?: string;
}
