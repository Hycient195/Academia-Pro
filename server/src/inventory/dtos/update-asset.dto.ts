// Academia Pro - Update Asset DTO
// Data Transfer Object for updating assets

import { IUpdateAssetRequest } from '@academia-pro/common/inventory';

export class UpdateAssetDto implements Partial<IUpdateAssetRequest> {
  name?: string;
  description?: string;
  category?: any;
  status?: any;
  location?: any;
  procurement?: any;
  financial?: any;
  specifications?: any;
}