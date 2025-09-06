// Academia Pro - Parent DTOs Index
// Export all parent portal DTOs

export { CreateParentDto } from './create-parent.dto';
export { UpdateParentDto } from './update-parent.dto';
export { ParentResponseDto, ParentListResponseDto, ParentStatisticsResponseDto } from './parent-response.dto';

// Re-export for convenience
export type {
  ICreateParentRequest,
  IUpdateParentRequest,
  IParentResponse,
  IParentListResponse,
  IParentStatisticsResponse,
  IParentFilters,
  ICreateCommunicationRequest,
  ICreateAppointmentRequest,
  IParentFeedbackRequest,
  IParentDashboardResponse,
  IParentCommunicationResponse,
  IParentAppointmentResponse,
} from '@academia-pro/types/parent/parent.types';