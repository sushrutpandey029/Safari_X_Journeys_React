import { API } from "./apiEndpoints";
import axios from "axios";

// export const getCountryList = async () => {
//   try {
//     const resp = await axios.get(API.COUNTRY_LIST);
//     return resp.data?.data?.CountryList || [];
//   } catch (err) {
//     throw err;
//   }
// };

export const getCityList = async (countryCode) => {
  try {
    const resp = await axios.post(API.CITY_LIST, {
      CountryCode: countryCode, // ✅ dynamic country
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

export const fetchHotelByCategory = async () => {
  try {
    const resp = await axios.post(API.HOTEL_BY_CATEGORY);
    return resp.data;
  } catch (err) {
    throw err;
  }
};
