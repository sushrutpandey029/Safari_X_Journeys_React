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

//forgot password start

export const forgotPassword = async (payload) => {
  console.log("api calling");
  console.log("payload in forgot password", payload);

  return await axios.post(API.USER_FORGOT_PASSWORD, payload, {
    headers: { "Content-Type": "application/json" },
  });
};

export const emailVerifyOtp = async (payload) => {
  console.log("api is working", payload);

  return await axios.post(API.USER_FORGOT_VERIFY_OTP, payload, {
    headers: { "Content-Type": "application/json" },
  });
};

export const resenOtp = async (payload) => {
  console.log("otp in resend forgot ot", payload);
  return await axios.post(API.RESEND_USER_OTP, payload, {
    headers: { "Content-Type": "application/json" },
  });
};

export const resetPassword = async (payload) => {
  return await axios.post(API.USER_RESET_PASSWORD, payload, {
    headres: { "Content-Type": "application/json" },
  });
};

//forgot paassowrd end

//driver

export const driverGuideLogin = async (payload) => {
  try {
    const response = await axios.post(API.DRIVER_GUIDE_LOGIN, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
