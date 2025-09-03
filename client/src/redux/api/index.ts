import { authApi } from "./authApi";
import { schoolAdminApi } from "./schoolAdminApi";
import { superAdminApi } from "./superAdminApi";

// Export API instances
export const apis = {
    auth: authApi,
    schoolAdmin: schoolAdminApi,
    superAdmin: superAdminApi
};

export default apis;