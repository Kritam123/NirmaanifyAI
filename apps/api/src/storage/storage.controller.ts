import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiProperty, ApiPropertyOptional, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Response } from 'express';
import { StorageDriverType, ProjectStorageConfig } from '@nirmaanify/types';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

export class SwitchDriverDto {
  @ApiProperty({
    enum: ['local', 's3', 'vercel-blob'],
    example: 's3',
    description: 'Target storage driver to activate',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['local', 's3', 'vercel-blob'])
  driver!: StorageDriverType;

  @ApiPropertyOptional({
    description: 'Optional target project ID to set individual storage driver for',
    example: 'd8c1c4f5-7e88-4674-a035-64f331b26f8d',
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}

export class UpdateProjectStorageConfigControllerDto {
  @ApiProperty({ description: 'Target project ID' })
  @IsNotEmpty()
  @IsString()
  projectId!: string;

  @ApiPropertyOptional({ enum: ['local', 's3', 'vercel-blob'] })
  @IsOptional()
  @IsString()
  driver?: StorageDriverType;

  @ApiProperty({ description: 'Project storage configuration and secrets' })
  @IsNotEmpty()
  config!: ProjectStorageConfig;
}

export class TestStorageConnectionControllerDto {
  @ApiPropertyOptional({ description: 'Target project ID to pull saved credentials from' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ enum: ['local', 's3', 'vercel-blob'], description: 'Driver to test' })
  @IsNotEmpty()
  @IsString()
  driver!: StorageDriverType;

  @ApiPropertyOptional({ description: 'Test config payload to test before saving' })
  @IsOptional()
  config?: ProjectStorageConfig;
}

@ApiTags('Storage Engine')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get storage driver status (optionally scoped to a project)' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Individual project ID' })
  async getStatus(@Query('projectId') projectId?: string) {
    return this.storageService.getStatusForProject(projectId);
  }

  @Post('switch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Switch storage driver for an individual project or default' })
  async switchDriver(@Body() body: SwitchDriverDto) {
    if (!body.driver) {
      throw new BadRequestException('Driver property is required (local, s3, or vercel-blob)');
    }

    if (body.projectId) {
      return this.storageService.setProjectDriver(body.projectId, body.driver);
    }

    const updated = this.storageService.setDefaultDriver(body.driver);
    return {
      message: `Default storage driver switched to ${body.driver}`,
      driver: updated,
    };
  }

  @Put('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Update storage configuration, secrets and credentials for an individual project' })
  async updateConfig(@Body() body: UpdateProjectStorageConfigControllerDto) {
    if (!body.projectId) {
      throw new BadRequestException('projectId is required');
    }
    return this.storageService.updateProjectStorageConfig({
      projectId: body.projectId,
      driver: body.driver,
      config: body.config,
    });
  }

  @Post('test-connection')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Test connectivity to a storage provider with provided or saved credentials' })
  async testConnection(@Body() body: TestStorageConnectionControllerDto) {
    if (!body.driver) {
      throw new BadRequestException('driver is required');
    }
    return this.storageService.testStorageConnection({
      projectId: body.projectId,
      driver: body.driver,
      config: body.config,
    });
  }

  @Get('files')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List files stored in active storage (optionally scoped to project)' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Individual project ID' })
  async listFiles(@Query('projectId') projectId?: string) {
    const status = await this.storageService.getStatusForProject(projectId);
    const files = await this.storageService.listFiles(projectId);
    return {
      activeDriver: status.activeDriver,
      projectId: status.projectId,
      projectName: status.projectName,
      count: files.length,
      files,
    };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Upload file to project-individual or active storage driver' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', default: 'uploads' },
        projectId: { type: 'string', description: 'Individual project ID to isolate storage to' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('projectId') projectId?: string
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.storageService.uploadFile(
      {
        filename: file.originalname,
        buffer: file.buffer,
        mimeType: file.mimetype,
        folder: folder || 'uploads',
        projectId,
      },
      projectId
    );

    return result;
  }

  @Get('files/:key')
  @ApiOperation({ summary: 'Download or stream file from storage' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Individual project ID' })
  async getFile(
    @Param('key') key: string,
    @Query('projectId') projectId: string | undefined,
    @Res() res: Response
  ) {
    try {
      const decodedKey = decodeURIComponent(key);
      const buffer = await this.storageService.getFile(decodedKey, projectId);
      const filename = decodedKey.split('/').pop() || 'file';
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.send(buffer);
    } catch {
      res.status(404).json({ success: false, message: `File ${key} not found` });
    }
  }

  @Delete('files/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Delete file from active storage driver (Owner/Admin/Dev only)' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Individual project ID' })
  async deleteFile(
    @Param('key') key: string,
    @Query('projectId') projectId?: string
  ) {
    const decodedKey = decodeURIComponent(key);
    const success = await this.storageService.deleteFile(decodedKey, projectId);
    return {
      key: decodedKey,
      projectId,
      deleted: success,
    };
  }
}
