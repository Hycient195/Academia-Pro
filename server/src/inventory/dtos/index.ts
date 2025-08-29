// Academia Pro - Inventory DTOs Index
// Export all inventory and asset management DTOs

export { CreateAssetDto } from './create-asset.dto';
export { UpdateAssetDto } from './update-asset.dto';
export { AssetResponseDto, AssetListResponseDto, AssetStatisticsResponseDto } from './asset-response.dto';

// Re-export for convenience
export type {
  ICreateAssetRequest,
  IUpdateAssetRequest,
  IAssetResponse,
  IAssetListResponse,
  IAssetStatisticsResponse,
  IAssetFilters,
  IProcurementFilters,
  IMaintenanceFilters,
  IAssetReport,
  IAssetDashboardData,
} from '../../../../common/src/types/inventory/inventory.types';