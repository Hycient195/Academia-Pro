import { authApi } from "./authApi";
import { schoolAdminApi } from "./schoolAdminApi";
import { superAdminApi } from "./superAdminApi";
import { schoolsApi } from "./schoolsApi";

// Export API instances
export const apis = {
    auth: authApi,
    schoolAdmin: schoolAdminApi,
    superAdmin: superAdminApi,
    schools: schoolsApi
};

export default apis;