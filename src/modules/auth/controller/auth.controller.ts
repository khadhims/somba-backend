import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post(['auth/signin', 'auth/login'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User sign in' })
  @ApiResponse({ status: 200, description: 'Return JWT token' })
  async login(@Body() loginDto: LoginDto) {
    const email = loginDto.username ?? loginDto.email;
    if (!email) {
      throw new BadRequestException('username or email is required');
    }
    const user = await this.authService.validateUser(
      email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('auth/signup')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User created' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refresh_token);
  }

  @Post('forgot_password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req) {
    return req.user;
  }
}
