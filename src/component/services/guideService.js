import { getUserData, getUserToken } from "../utils/storage";
import { API } from "./apiEndpoints";
import axios from "axios";

export const guideLogin = async (payload) => {
  try {
    const response = await axios.post(API.GUIDE_LOGIN, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllGuides = async (filters = {}) => {
  try {
    const response = await axios.get(API.GUIDE_LIST, { params: filters });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const guideUpdateProfile = async (payload) => {
  try {
    const guide = getUserData("guide");
    console.log("guide from local storage", guide);

    const resp = await axios.put(
      API.GUIDE_UPDATE_PROFILE(guide.guideId),
      payload,
    );
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
      API.GUIDE_CHANGE_PASSWORD(guide.guideId),
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
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
        "Content-Type": "multipart/form-data",
      },
    });
    return resp.data;
  } catch (err) {
    console.log("error in career guide submit", err.response);
    throw err;
  }
};

export const GuideLogout = async () => {
  // const guide = await getUserData("guide")
  try {
    const response = await axios.post(API.GUIDE_LOGOUT);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const guideApplyLeave = async (payload) => {
  return await axios.post(API.GUIDE_MARK_LEAVE(payload.guideId), payload, {
    headers: { "Content-Type": "application/json" },
  });
};
export const guideLeaveHistory = async (id) => {
  return await axios.get(API.GUIDE_LEAVE_HISTORY(id), {
    headers: { "Content-Type": "application/json" },
  });
};

export const guideBookingHistory = async (id) => {
  return await axios.get(API.GUIDE_BOOKING_HISTORY(id), {
    headers: { "Content-Type": "application/json" },
  });
};

export const guideEarnings = async (id) => {
  return await axios.get(API.GUIDE_EARNING(id), {
    headers: { "Content-Type": "application/json" },
  });
};

export const guidePayouts = async (id) => {
  return await axios.get(API.GUIDE_PAYOUT(id), {
    headers: { "Content-Type": "application/json" },
  });
};
