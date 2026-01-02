// export const BASE_URL = "https://7183d0378457.ngrok-free.app";

// export const BASE_URL = "http://node.millclient.com:3001";
// export const BASE_URL = "http://localhost:2625/";
// export const BASE_URL = "http://10.31.33.26:2625";
// export const BASE_URL = "https://0764024fc8ea.ngrok-free.app";
export const BASE_URL = "http://192.168.1.4:2625";

export const API = {
  CONTACT_US: `${BASE_URL}/api/send/contactUs`,
  CAB_LIST: `${BASE_URL}/api/cab/list`,
  DRIVER_GUIDE_LOGIN: `${BASE_URL}/api/driver-guide/role-based-login`,
  DRIVER_GUIDE_LOGOUT: `${BASE_URL}/api/driver-guide/logout`,
  NEWSLATER: `${BASE_URL}/api/news/later`,
  CHATBOT_SUBMIT: `${BASE_URL}/api/chatbot`,
  GET_ALL_CITIES: `${BASE_URL}/api/getCities`,

  //user
  REGISTER_OR_LOGIN: `${BASE_URL}/api/user/register-or-login`,
  USER_LOGOUT: `${BASE_URL}/api/user/logout`,
  BANNER_IMAGE: `${BASE_URL}/api/banner/image`,
  FAQ_LIST: `${BASE_URL}/api/FAQ/list`,
  BLOGS: `${BASE_URL}/api/Blog/list`,
  TESTIMONIAL_LIST: `${BASE_URL}/api/testimonial/list`,
  USER_CHANGE_PASSWORD: (id) => `${BASE_URL}/api/user/change-password/${id}`,
  USER_UPDATE_PROFILE: (id) => `${BASE_URL}/api/user/update-profile/${id}`,
  USER_BOOKING_DETAILS: (id) => `${BASE_URL}/api/user/booking-details/${id}`,

  //driver
  DRIVER_UPDATE_PROFILE: (id) => `${BASE_URL}/driver/update/${id}`,
  DRIVER_CHANGE_PASSWORD: (id) => `${BASE_URL}/driver/change-password/${id}`,

  //guide
  GUIDE_LIST: `${BASE_URL}/api/guide/list`,
  GUIDE_CAREER_SUBMIT: `${BASE_URL}/guide/career-guide`,
  GUIDE_UPDATE_PROFILE: (id) => `${BASE_URL}/guide/update/${id}`,
  GUIDE_CHANGE_PASSWORD: (id) => `${BASE_URL}/guide/change-password/${id}`,

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
  HOTEL_BY_CATEGORY: `${BASE_URL}/api/getHotelCityByCategory`,
  HOTEL_PREBOOK: `${BASE_URL}/api/prebook`,
  HOTEL_CANCEL: `${BASE_URL}/api/hotel/cancel`,
  HOTEL_CANCEL_STATUS: `${BASE_URL}/api/hotel/cancel-status`,
  USER_HOTEL_BOOKING_DETAILS: `${BASE_URL}/api/booking-detail`,
  HOTEL_BY_CATEGORY: `${BASE_URL}/api/getHotelCityByCategory`,

  // flights
  Flight_Indian_Airports: `${BASE_URL}/flight/getIndianAirports`,
  Flight_authenticate: `${BASE_URL}/flight/authenticate`,
  flight_search: `${BASE_URL}/flight/search-flights`,
  Flight_farerule: `${BASE_URL}/flight/fare-rule`,
  Flight_farequote: `${BASE_URL}/flight/fare-quote`,
  flight_getBookingDetails: `${BASE_URL}/flight/get-booking-details`,
  flight_sendChangeRequest: `${BASE_URL}/flight/send-change-request`,
  flight_getChangeRequestStatus: `${BASE_URL}/flight/get-change-request-status`,
  flight_SSR: `${BASE_URL}/flight/SSR-flight`,

  // BUS
  Bus_Authenticate: `${BASE_URL}/Bus/Authenticate`,
  Bus_getcitylist: `${BASE_URL}/Bus/getBusCityList`,
  Bus_searchbus: `${BASE_URL}/Bus/busSearch`,
  Bus_busLayout: `${BASE_URL}/Bus/bus-layout`,
  Bus_block: `${BASE_URL}/Bus/bus-block`,
  Bus_boardingPoints: `${BASE_URL}/Bus/bus-boarding-points`,
  Bus_getBookingDetails: `${BASE_URL}/bus/getBookingDetail`,
  Bus_sendChangeRequest: `${BASE_URL}/bus/send-change-request`,
  Bus_getChangeRequestStatus: `${BASE_URL}/bus/get-change-request-status`,

  //cancel boooking
  CANCEL_BOOKING: `${BASE_URL}/api/booking/cancel/confirm`,

  //insurance endpoints
  SEARCH_INSURANCE: `${BASE_URL}/insurance/search`,
  GET_INSURANCE_BOOKING_DETAILS: `${BASE_URL}/insurance/getBookingDetail`,
};
