import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.uid };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    return {
      access_token,
      refresh_token,
      user,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const newPayload = { email: user.email, sub: user.uid };
      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
        user,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    return {
      message: `If an account exists for ${email}, a reset link has been sent.`,
    };
  }

  async register(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.password_confirmation) {
      throw new ConflictException('Password confirmation does not match');
    }

    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      email: registerDto.email,
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      password_hash: hashedPassword,
    });

    const { password_hash, ...result } = user;
    return result;
  }
}
