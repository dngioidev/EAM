import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  getModuleStatus() {
    return {
      module: 'reports',
      status: 'ready',
      nextTasks: [
        'T030 GET /reports/daily',
        'T031 GET /reports/monthly',
        'T032 GET /reports/invoices/export',
      ],
    };
  }
}
