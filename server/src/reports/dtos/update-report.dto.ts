// Academia Pro - Update Report DTO
// Data Transfer Object for updating reports

import { IUpdateReportRequest } from '../../../../common/src/types/reports/reports.types';

export class UpdateReportDto implements Partial<IUpdateReportRequest> {
  title?: string;
  description?: string;
  parameters?: any;
  schedule?: any;
  isActive?: boolean;
  isPublic?: boolean;
}