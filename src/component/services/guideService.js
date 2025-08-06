import { getUserData, getUserToken } from "../utils/storage";
import { API } from "./apiEndpoints";
import axios from "axios";

export const getAllGuides = async () => {
  try {
    const response = await axios.get(API.GUIDE_LIST);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const guideUpdateProfile = async (payload) => {
  try {
    const guide = getUserData("guide");
    console.log("guide from local storage", guide);

    const resp = await axios.put(API.GUIDE_UPDATE_PROFILE(guide.id), payload);
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const guideChangePassword = async (payload) => {
  try {
    const token = getUserToken("guide_token");
    const guide = getUserData("guide");
    const resp = await axios.post(
      API.GUIDE_CHANGE_PASSWORD(guide.id),
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const guideCareerSubmit = async (payload) => {
  try {
    const token = getUserToken("guide_token");
    const resp = await axios.post(API.GUIDE_CAREER_SUBMIT, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return resp.data;
  } catch (err) {
    console.log("error in career guide submit",err.response)
    throw err;
  }
};
