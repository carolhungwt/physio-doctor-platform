// apps/api/src/profiles/profiles.controller.ts
import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { CreatePhysioProfileDto } from './dto/create-physio-profile.dto';

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

  @Put('patient')
  @UseGuards(JwtAuthGuard)
  async updatePatientProfile(
      @Request() req,
      @Body() updatePatientProfileDto: CreatePatientProfileDto
  ) {
    return this.profilesService.updatePatientProfile(
        req.user.userId,
        updatePatientProfileDto
    );
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

  @Put('doctor')
  @UseGuards(JwtAuthGuard)
  async updateDoctorProfile(
      @Request() req,
      @Body() updateDoctorProfileDto: CreateDoctorProfileDto
  ) {
    return this.profilesService.updateDoctorProfile(
        req.user.userId,
        updateDoctorProfileDto
    );
  }

  // Physiotherapist endpoints
  @Post('physio')
  @UseGuards(JwtAuthGuard)
  async createPhysioProfile(
      @Request() req,
      @Body() createPhysioProfileDto: CreatePhysioProfileDto
  ) {
    return this.profilesService.createPhysioProfile(
        req.user.userId,
        createPhysioProfileDto
    );
  }

  @Get('physio')
  @UseGuards(JwtAuthGuard)
  async getPhysioProfile(@Request() req) {
    return this.profilesService.getPhysioProfile(req.user.userId);
  }

  @Put('physio')
  @UseGuards(JwtAuthGuard)
  async updatePhysioProfile(
      @Request() req,
      @Body() updatePhysioProfileDto: CreatePhysioProfileDto
  ) {
    return this.profilesService.updatePhysioProfile(
        req.user.userId,
        updatePhysioProfileDto
    );
  }
}