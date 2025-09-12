import { authApi } from "./authApi";
import superAdminApis from "./super-admin";
import schoolAdminApis from "./school-admin";

const apis = {
    auth: authApi,
    schoolAdmin: schoolAdminApis,
    superAdmin: superAdminApis
};

export default apis;