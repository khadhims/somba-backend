import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @ValidateIf((o: LoginDto) => !o.email)
  @IsEmail()
  @IsNotEmpty()
  username?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @ValidateIf((o: LoginDto) => !o.username)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
