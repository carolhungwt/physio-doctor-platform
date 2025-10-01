// apps/api/src/profiles/profiles.controller.ts
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // Patient endpoints
  @Post('patient')
  @UseGuards(JwtAuthGuard)
  async createPatientProfile(
      @Request() req,
      @Body() createPatientProfileDto: CreatePatientProfileDto
  ) {
    return this.profilesService.createPatientProfile(
        req.user.userId,
        createPatientProfileDto
    );
  }

  @Get('patient')
  @UseGuards(JwtAuthGuard)
  async getPatientProfile(@Request() req) {
    return this.profilesService.getPatientProfile(req.user.userId);
  }

  // Doctor endpoints
  @Post('doctor')
  @UseGuards(JwtAuthGuard)
  async createDoctorProfile(
      @Request() req,
      @Body() createDoctorProfileDto: CreateDoctorProfileDto
  ) {
    return this.profilesService.createDoctorProfile(
        req.user.userId,
        createDoctorProfileDto
    );
  }

  @Get('doctor')
  @UseGuards(JwtAuthGuard)
  async getDoctorProfile(@Request() req) {
    return this.profilesService.getDoctorProfile(req.user.userId);
  }
}