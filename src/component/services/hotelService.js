import { API } from "./apiEndpoints";
import axios from "axios";

export const getCountryList = async () => {
  try {
    const resp = await axios.post(API.COUNTRY_LIST);
    console.log("counyry list data",resp.data)
    return resp.data?.data?.CountryList || [];
  } catch (err) {
    throw err;
  }
};

export const getCityList = async (countryCode) => {
  try {
    const resp = await axios.post(API.CITY_LIST, {
      CountryCode: countryCode,
    });
    return resp.data?.data?.CityList || [];
  } catch (err) {
    throw err;
  }
};

export const getHotelCodeList = async (countryCode, cityCode) => {
  try {
    const resp = await axios.post(API.HOTEL_CODE_LIST, {
      CountryCode: countryCode,
      CityCode: cityCode,
    });
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const getHotelCodeListNew = async (countryCode, cityCode) => {
  try {
    console.log("code", countryCode, cityCode);
    const resp = await axios.post(API.HOTEL_CODE_LIST_NEW, {
      CountryCode: countryCode,
      CityCode: cityCode,
    });
    return resp.data;
  } catch (err) {
    console.error("Error in getHotelCodeListNew:", err);
    throw err;
  }
};

export const getHotelDetail = async (hotelCode) => {
  try {
    const resp = await axios.post(API.HOTEL_DETAIL, {
      HotelCode: hotelCode, // ✅ backend ko HotelCode chahiye
    });
    return resp.data;
  } catch (err) {
    console.error("Error in getHotelDetail:", err);
    throw err;
  }
};

export const searchHotels = async (payload) => {
  try {
    const resp = await axios.post(API.HOTEL_SEARCH, payload);
    console.log("data in serch hotels",resp.data);
    // console.log("data in serch hotels",JSON.stringify(resp.data) );
    // Directly return inner data
    return resp.data?.data;
  } catch (err) {
    console.error("Error in searchHotels:", err);
    throw err;
  }
};

export const fetchCityList = async (countryCode) => {
  try {
    const resp = await axios.post(API.CITY_LIST_FILTER, {
      CountryCode: countryCode,
    });
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const getHotelCityByCategory = async () => {
  try {
    const resp = await axios.get(API.HOTEL_BY_CATEGORY);
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const cancelHotelBooking = async (payload) => {
  return await axios.post(API.HOTEL_CANCEL, payload);
};

export const getHotelCancelStatus = async (payload) => {
  return await axios.post(API.HOTEL_CANCEL_STATUS, payload);
};
export const hotel_prebook = async (payload) => {
  return await axios.post(API.HOTEL_PREBOOK, payload);
};

export const getUserHotelBookingDetails = async (payload) => {
  try {
    const resp = await axios.post(API.USER_HOTEL_BOOKING_DETAILS, payload);
    return resp.data;
  } catch (err) {
    throw err;
  }
};
