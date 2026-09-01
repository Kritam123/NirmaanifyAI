import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Response } from 'express';
import { StorageDriverType } from '@nirmaanify/types';
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
}

@ApiTags('Storage Engine')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all storage drivers status and currently active driver' })
  getStatus() {
    return {
      activeDriver: this.storageService.getActiveDriverType(),
      drivers: this.storageService.getAllDriversStatus(),
    };
  }

  @Post('switch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Switch active storage driver in one click (Owner/Admin only)' })
  switchDriver(@Body() body: SwitchDriverDto) {
    if (!body.driver) {
      throw new BadRequestException('Driver property is required (local, s3, or vercel-blob)');
    }
    const updated = this.storageService.setActiveDriver(body.driver);
    return {
      message: `Active storage driver switched to ${body.driver}`,
      driver: updated,
    };
  }

  @Get('files')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List files stored in active storage' })
  async listFiles() {
    const files = await this.storageService.listFiles();
    return {
      activeDriver: this.storageService.getActiveDriverType(),
      count: files.length,
      files,
    };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Upload file to active storage driver (Owner/Admin/Dev only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', default: 'uploads' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.storageService.uploadFile({
      filename: file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
      folder: folder || 'uploads',
    });

    return result;
  }

  @Get('files/:key')
  @ApiOperation({ summary: 'Download or stream file from storage' })
  async getFile(@Param('key') key: string, @Res() res: Response) {
    try {
      const buffer = await this.storageService.getFile(decodeURIComponent(key));
      res.setHeader('Content-Disposition', `inline; filename="${key}"`);
      res.send(buffer);
    } catch {
      res.status(404).json({ success: false, message: `File ${key} not found` });
    }
  }

  @Delete('files/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Delete file from active storage driver (Owner/Admin/Dev only)' })
  async deleteFile(@Param('key') key: string) {
    const success = await this.storageService.deleteFile(decodeURIComponent(key));
    return {
      key,
      deleted: success,
    };
  }
}
