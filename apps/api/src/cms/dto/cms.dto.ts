import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsArray,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CmsCollectionType,
  CmsFieldType,
  CmsContentStatus,
  CmsFieldValidation,
} from '@nirmaanify/types';

export class CreateCmsCollectionDto {
  @ApiProperty({ description: 'Display name of collection', example: 'Blog Posts' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug', example: 'posts' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'Description of collection' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['POSTS', 'PRODUCTS', 'CATEGORIES', 'AUTHORS', 'CUSTOM'], default: 'CUSTOM' })
  @IsOptional()
  type?: CmsCollectionType;

  @ApiPropertyOptional({ description: 'Initial field schema list' })
  @IsArray()
  @IsOptional()
  fields?: CreateCmsFieldDto[];
}

export class UpdateCmsCollectionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateCmsFieldDto {
  @ApiProperty({ description: 'Display name for the field', example: 'Featured Image' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Field key/identifier', example: 'featuredImage' })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiProperty({
    enum: [
      'TEXT',
      'RICH_TEXT',
      'NUMBER',
      'BOOLEAN',
      'DATE',
      'IMAGE',
      'FILE',
      'SELECT',
      'RELATION',
      'JSON',
    ],
  })
  @IsNotEmpty()
  type!: CmsFieldType;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({ description: 'Default fallback value' })
  @IsOptional()
  defaultValue?: any;

  @ApiPropertyOptional({ description: 'Validation rules & constraints' })
  @IsObject()
  @IsOptional()
  validation?: CmsFieldValidation;

  @ApiPropertyOptional({ description: 'Additional options or select choices' })
  @IsOptional()
  options?: any;

  @ApiPropertyOptional({ description: 'Display order index' })
  @IsNumber()
  @IsOptional()
  order?: number;
}

export class UpdateCmsFieldDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({
    enum: [
      'TEXT',
      'RICH_TEXT',
      'NUMBER',
      'BOOLEAN',
      'DATE',
      'IMAGE',
      'FILE',
      'SELECT',
      'RELATION',
      'JSON',
    ],
  })
  @IsOptional()
  type?: CmsFieldType;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  defaultValue?: any;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  validation?: CmsFieldValidation;

  @ApiPropertyOptional()
  @IsOptional()
  options?: any;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateCmsContentItemDto {
  @ApiPropertyOptional({ description: 'Custom URL slug for this entry' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ description: 'Dynamic key-value content data matching collection fields' })
  @IsObject()
  data!: Record<string, any>;

  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'], default: 'DRAFT' })
  @IsOptional()
  status?: CmsContentStatus;

  @ApiPropertyOptional({ description: 'Scheduled publication ISO date string' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class UpdateCmsContentItemDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'] })
  @IsOptional()
  status?: CmsContentStatus;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class SchedulePublishDto {
  @ApiProperty({ description: 'Future publication ISO date-time', example: '2026-10-01T12:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledAt!: string;
}

export class SeedPresetDto {
  @ApiProperty({ enum: ['POSTS', 'PRODUCTS', 'CATEGORIES', 'AUTHORS'] })
  @IsNotEmpty()
  type!: CmsCollectionType;
}

export class CmsFilterQueryDto {
  @ApiPropertyOptional({ enum: ['ALL', 'DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'] })
  @IsOptional()
  status?: CmsContentStatus | 'ALL';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: string;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
