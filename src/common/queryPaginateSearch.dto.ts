import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class QueryPageSearchDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}
