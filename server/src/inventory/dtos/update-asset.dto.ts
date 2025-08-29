// Academia Pro - Update Asset DTO
// Data Transfer Object for updating assets

import { IUpdateAssetRequest } from '../../../../common/src/types/inventory/inventory.types';

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