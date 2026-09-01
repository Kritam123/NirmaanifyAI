import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import { HealthCheckResult } from '@nirmaanify/types';

export class HealthService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Check backend platform API health status
   */
  async checkHealth(): Promise<HealthCheckResult> {
    return this.http.get<HealthCheckResult>(API_ENDPOINTS.HEALTH.CHECK);
  }
}
