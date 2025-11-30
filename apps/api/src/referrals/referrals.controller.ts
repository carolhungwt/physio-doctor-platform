import { Controller, Post, Get, Body, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReferral(
    @Request() req,
    @Body() createReferralDto: CreateReferralDto
  ) {
    return this.referralsService.createReferral(
      req.user.userId,
      createReferralDto
    );
  }

  @Get('doctor')
  @UseGuards(JwtAuthGuard)
  async getDoctorReferrals(@Request() req) {
    return this.referralsService.getReferralsByDoctor(req.user.userId);
  }

  @Get('patient')
  @UseGuards(JwtAuthGuard)
  async getPatientReferrals(@Request() req) {
    return this.referralsService.getReferralsByPatient(req.user.userId);
  }

  @Get('patient/active')
  @UseGuards(JwtAuthGuard)
  async getActivePatientReferrals(@Request() req) {
    return this.referralsService.getActiveReferralsForPatient(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getReferralById(
    @Request() req,
    @Param('id') referralId: string
  ) {
    return this.referralsService.getReferralById(referralId, req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateReferralStatus(
    @Request() req,
    @Param('id') referralId: string,
    @Body('status') status: string
  ) {
    return this.referralsService.updateReferralStatus(
      referralId,
      req.user.userId,
      status
    );
  }
}

