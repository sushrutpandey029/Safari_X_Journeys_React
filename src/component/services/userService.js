import axios from "axios";
import { API } from "./apiEndpoints";
import { getUserData, getUserToken } from "../utils/storage";

export const userChangePassword = async (payload) => {
  try {
    const user = await getUserData("safarix_user");
    const token = await getUserToken();
    const resp = await axios.post(API.USER_CHANGE_PASSWORD(user.id), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return resp.data;
  } catch (error) {
    throw error;
  }
};

//user update profile data
export const userUpdateProfile = async (payload) => {
  try {
    const user = await getUserData("safarix_user");
    const token = getUserToken();
    console.log("token in update profile fun", token);
    const resp = await axios.post(API.USER_UPDATE_PROFILE(user.id), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return resp.data;
  } catch (error) {
    throw error;
  }
};
