export const BASE_URL = "http://192.168.1.7:2625";

export const API = {
  CONTACT_US: `${BASE_URL}/api/send/contactUs`,
  CAB_LIST: `${BASE_URL}/api/cab/list`,

  DRIVER_GUIDE_LOGIN: `${BASE_URL}/api/driver-guide/role-based-login`,
  DRIVER_GUIDE_LOGOUT: `${BASE_URL}/api/driver-guide/logout`,
  NEWSLATER: `${BASE_URL}/api/news/later`,
  CHATBOT_SUBMIT : `${BASE_URL}/api/chatbot`,

  //user
  REGISTER_OR_LOGIN: `${BASE_URL}/api/user/register-or-login`,
  USER_LOGOUT: `${BASE_URL}/api/user/logout`,
  BANNER_IMAGE: `${BASE_URL}/api/banner/image`,
  FAQ_LIST: `${BASE_URL}/api/FAQ/list`,
  BLOGS: `${BASE_URL}/api/Blog/list`,
  TESTIMONIAL_LIST: `${BASE_URL}/api/testimonial/list`,
  USER_CHANGE_PASSWORD: (id) => `${BASE_URL}/api/user/change-password/${id}`,
  USER_UPDATE_PROFILE: (id) => `${BASE_URL}/api/user/update-profile/${id}`,

  //driver

  DRIVER_UPDATE_PROFILE: (id) => `${BASE_URL}/driver/update/${id}`,
  DRIVER_CHANGE_PASSWORD: (id) => `${BASE_URL}/driver/change-password/${id}`,

  //guide

  GUIDE_LIST: `${BASE_URL}/api/guide/list`,
  GUIDE_CAREER_SUBMIT: `${BASE_URL}/guide/career-guide`,
  GUIDE_UPDATE_PROFILE: (id) => `${BASE_URL}/guide/update/${id}`,
  GUIDE_CHANGE_PASSWORD: (id) => `${BASE_URL}/guide/change-password/${id}`,
};
