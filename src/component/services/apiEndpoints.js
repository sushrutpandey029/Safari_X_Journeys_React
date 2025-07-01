export const BASE_URL = "http://192.168.1.12:2625";

export const API = {
  REGISTER_OR_LOGIN: `${BASE_URL}/api/user/register-or-login`,
  USER_LOGOUT : `${BASE_URL}/api/user/logout`,
  BANNER_IMAGE: `${BASE_URL}/api/banner/image`,
  FAQ_LIST: `${BASE_URL}/api/FAQ/list`,
  BLOGS: `${BASE_URL}/api/Blog/list`,
  GUIDE_LIST: `${BASE_URL}/api/guide/list`,
  CONTACT_US: `${BASE_URL}/api/send/contactUs`,
  CAB_LIST: `${BASE_URL}/api/cab/list`,
  USER_CHANGE_PASSWORD: (id) => `${BASE_URL}/api/user/change-password/${id}`,
  USER_UPDATE_PROFILE: (id) => `${BASE_URL}/api/user/update-profile/${id}`,
  DRIVER_GUIDE_LOGIN : `${BASE_URL}/api/driver-guide/role-based-login`,
  DRIVER_GUIDE_LOGOUT : `${BASE_URL}/api/driver-guide/logout`,

};
