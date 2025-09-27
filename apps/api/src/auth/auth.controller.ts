import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from '../common/dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req): Promise<Omit<User, 'hashedPassword'>> {
        const { hashedPassword, ...userProfile } = req.user;
        return userProfile;
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify-token')
    async verifyToken(@Request() req): Promise<{ valid: boolean; user: any }> {
        return {
            valid: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role,
                isVerified: req.user.isVerified,
            },
        };
    }
}