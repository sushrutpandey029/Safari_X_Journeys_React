// export const BASE_URL = "https://fdc7b4f21736.ngrok-free.app";
// export const BASE_URL = "http://localhost:2625";
// export const BASE_URL = "http://192.168.1.14:2625";
export const BASE_URL = "http://node.millclient.com:3001";

export const API = {
  CONTACT_US: `${BASE_URL}/api/send/contactUs`,
  CAB_LIST: `${BASE_URL}/api/cab/list`,

  DRIVER_GUIDE_LOGIN: `${BASE_URL}/api/driver-guide/role-based-login`,
  DRIVER_GUIDE_LOGOUT: `${BASE_URL}/api/driver-guide/logout`,
  NEWSLATER: `${BASE_URL}/api/news/later`,
  CHATBOT_SUBMIT: `${BASE_URL}/api/chatbot`,

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

  // INITIATE_PAYMENT : `${BASE_URL}/api/payment/initiate`,
  // CHECK_PAYMENT_STATUS:`${BASE_URL}/api/payment/verify`,
  // Booking + Payment
  CREATE_BOOKING_DRAFT: `${BASE_URL}/api/booking/create-draft`,
  INITIATE_PAYMENT: `${BASE_URL}/api/payment/initiate`,
  CHECK_PAYMENT_STATUS: `${BASE_URL}/api/payment/verify`,
  GET_PAYMENT_STATUS: (orderId) =>
    `${BASE_URL}/api/payment-status?order_id=${orderId}`,

  // hotels
  // COUNTRY_LIST: `${BASE_URL}/api/country-list`,
  CITY_LIST: `${BASE_URL}/api/citylist`,
  HOTEL_CODE_LIST: `${BASE_URL}/api/hotel-code-list`,
  HOTEL_CODE_LIST_NEW: `${BASE_URL}/api/search-list-new`,
  HOTEL_DETAIL: `${BASE_URL}/api/hotels`,
  HOTEL_SEARCH: `${BASE_URL}/api/search-hotels`,

  CITY_LIST_FILTER: `${BASE_URL}/api/filter/citylist`,
};
