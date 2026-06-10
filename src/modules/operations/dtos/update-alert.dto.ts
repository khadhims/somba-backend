import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAlertDto {
  @ApiProperty({
    example: 'resolved',
    enum: ['notResolved', 'resolved', 'falseAlarm'],
  })
  @IsEnum(['notResolved', 'resolved', 'falseAlarm'])
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: 'Resolved after inspection', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
