// Academia Pro - Update Parent DTO
// Data Transfer Object for updating parent profiles

import { IUpdateParentRequest } from '@academia-pro/types/parent/parent.types';

export class UpdateParentDto implements Partial<IUpdateParentRequest> {
  relationship?: any;
  isPrimaryContact?: boolean;
  emergencyContact?: boolean;
  portalAccessLevel?: any;
  notificationPreferences?: any;
  contactInformation?: any;
  profile?: any;
}