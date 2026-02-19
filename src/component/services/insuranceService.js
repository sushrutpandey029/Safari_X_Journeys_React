import axios from "axios";
import { API } from "./apiEndpoints";

export const searchInsurance = async (payload) => {
  return axios.post(API.SEARCH_INSURANCE, payload, {
    headers: { "Content-Type": "application/json" },
  });
};

export const insuranceBookingDetails = async (payload) => {
  return axios.post(API.GET_INSURANCE_BOOKING_DETAILS, payload, {
    headers: { "Content-Type": "application/json" },
  });
};
