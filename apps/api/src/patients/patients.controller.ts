import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  // List all patients (for doctors to select when creating referrals)
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllPatients(
    @Request() req,
    @Query('search') search?: string
  ) {
    return this.patientsService.getAllPatients(search);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getPatientProfile(@Request() req) {
    return this.patientsService.getPatientWithProfile(req.user.userId);
  }
}

