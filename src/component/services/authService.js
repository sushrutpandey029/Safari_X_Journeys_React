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
