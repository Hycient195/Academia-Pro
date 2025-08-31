// Academia Pro - Update Staff DTO
// Data Transfer Object for updating staff members

import { IUpdateStaffRequest } from '@academia-pro/common/staff';

export class UpdateStaffDto implements Partial<IUpdateStaffRequest> {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  address?: any;
  department?: any;
  position?: any;
  employmentType?: any;
  contractEndDate?: Date;
  salary?: any;
  emergencyContact?: any;
  workSchedule?: any;
  benefits?: any;
  managerId?: string;
  employmentStatus?: any;
}