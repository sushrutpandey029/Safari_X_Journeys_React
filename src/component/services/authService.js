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

export const driverGuideLogin = async (payload) => {
  try {
    const response = await axios.post(API.DRIVER_GUIDE_LOGIN, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const driverGuideLogout = async () => {
  try{
    const response = await axios.post(API.DRIVER_GUIDE_LOGOUT);
    return response.data
  }catch(error){
    throw error;
  }
}
