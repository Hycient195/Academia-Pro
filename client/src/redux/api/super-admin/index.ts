import { superAdminAuthApi } from "./authApis";
import { commonApis } from "./commonApis";
import { analyticsApi } from "./analyticsApis";
import { auditApi } from "./auditApis";
import { iamApi } from "./iamApis";
import { schoolsApi } from "./schoolsApis";
import { settingsApi } from "./settingsApis";
import { systemApi } from "./systemApis";

const superAdminApis = {
    auth: superAdminAuthApi,
    common: commonApis,
    analytics: analyticsApi,
    audit: auditApi,
    iam: iamApi,
    schools: schoolsApi,
    settings: settingsApi,
    system: systemApi
}

export default superAdminApis