import { studentApi } from './studentApis';
import { commonApis } from './commonApis';
import { staffApi } from './staffApis';
import { departmentApi } from './departmentApis';
import { academicApi } from './academicApis';
import { financialApi } from './financialApis';
import { communicationApi } from './communicationApis';
import { attendanceApi } from './attendanceApis';

const schoolAdminApis = {
    academic: academicApi,
    financial: financialApi,
    communication: communicationApi,
    staff: staffApi,
    department: departmentApi,
    student: studentApi,
    attendance: attendanceApi,
    general: commonApis,
}

export default schoolAdminApis