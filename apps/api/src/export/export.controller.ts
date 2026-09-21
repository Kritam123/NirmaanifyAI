import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProjectExportService } from './project-export.service';
import { ExportGithubDto, GithubExportResultDto } from '@nirmaanify/types';

@ApiTags('Project Export')
@Controller('projects/:id/export')
export class ExportController {
  constructor(private readonly exportService: ProjectExportService) {}

  @Get('zip')
  @ApiOperation({ summary: 'Stream production-ready monorepo ZIP archive' })
  @ApiResponse({ status: 200, description: 'Direct binary ZIP stream' })
  async downloadZip(
    @Param('id') projectId: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.exportService.streamZipArchive(projectId, res);
  }

  @Post('github')
  @ApiOperation({ summary: 'Direct push full-stack codebase to a GitHub repository' })
  @ApiResponse({ status: 201, description: 'Codebase pushed to GitHub' })
  async pushToGithub(
    @Param('id') projectId: string,
    @Body() dto: ExportGithubDto,
    @Request() req: any,
  ): Promise<GithubExportResultDto> {
    return this.exportService.pushToGithub(projectId, dto, req.user?.id);
  }
}
