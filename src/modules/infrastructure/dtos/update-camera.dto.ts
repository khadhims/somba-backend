import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateCameraDto } from './create-camera.dto';

export class UpdateCameraDto extends PartialType(CreateCameraDto) {
  @ApiProperty({
    example: 'memasak',
    description: 'Activity label for edge worker recording',
  })
  @IsString()
  @IsNotEmpty()
  activity: string;
}
