import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import { ExportGithubDto, GithubExportResultDto } from '@nirmaanify/types';

export class ExportService {
  constructor(private readonly http: HttpClient) {}

  getZipUrl(projectId: string): string {
    return this.http.resolveUrl(API_ENDPOINTS.EXPORT.ZIP(projectId));
  }

  async pushToGithub(projectId: string, dto: ExportGithubDto): Promise<GithubExportResultDto> {
    return this.http.post<GithubExportResultDto>(API_ENDPOINTS.EXPORT.GITHUB(projectId), dto);
  }
}
