import { API } from "./apiEndpoints";
import axios from "axios";

export const registerOrLogin = async (payload) => {
  try {
    const response = await axios.post(API.REGISTER_OR_LOGIN, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const userLogout = async () => {
  try {
    const response = await axios.post(API.USER_LOGOUT);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const userVerifyEmailOtp = async (payload) => {
   return await axios.post(API.USER_VERIFY_OTP, payload, {
    headers: { "Content-Type": "application/json" },
  });
};
export const userResendOtp = async (payload) => {
   return await axios.post(API.USER_RESEND_OTP, payload, {
    headers: { "Content-Type": "application/json" },
  });
};

export const driverGuideLogin = async (payload) => {
  try {
    const response = await axios.post(API.DRIVER_GUIDE_LOGIN, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
