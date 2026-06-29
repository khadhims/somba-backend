import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { getLocalToday } from './utils/date.util';

/**
 * Canonical query DTO for paginated, searchable, sortable list endpoints.
 * Field names mirror the public API contract consumed by the web UI
 * (page_size, sort_by, from_date, etc.).
 */
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
  page_size?: number = 10;

  // Default to "today" (business timezone) when the client omits the range, so
  // every list endpoint scopes to the current day by default. Evaluated per
  // request because class-transformer runs this initializer on each instance.
  @IsOptional()
  @IsString()
  from_date?: string = getLocalToday();

  @IsOptional()
  @IsString()
  to_date?: string = getLocalToday();

  @IsOptional()
  @IsUUID()
  camera_uuid?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort_by?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_order?: 'asc' | 'desc' = 'desc';
}
