import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, AuthResponseDto } from '../common/dto/auth.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if email already exists
    const existingEmail = await this.usersService.findByEmail(registerDto.email);
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if username already exists
    const existingUsername = await this.usersService.findByUsername(registerDto.username);
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    // Check if phone already exists (if provided)
    if (registerDto.phone) {
      const existingPhone = await this.usersService.findByPhone(registerDto.phone);
      if (existingPhone) {
        throw new ConflictException('Phone number is already registered');
      }
    }

    // Create new user
    const user = await this.usersService.create(registerDto);

    // Generate JWT token
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by identifier (email, username, or phone)
    const user = await this.usersService.findByIdentifier(loginDto.identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.hashedPassword,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate JWT token
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }
}
