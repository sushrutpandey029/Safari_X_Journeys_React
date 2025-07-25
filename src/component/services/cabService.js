import axios from "axios";
import { API } from "./apiEndpoints";
import { getUserData, getUserToken } from "../utils/storage";

//cabs

export const fetchCabList = async () => {
  try {
    const response = await axios.get(API.CAB_LIST);
    return response.data;
  } catch (error) {
    throw error;
  }
};




//driver

export const driverUpdateProfile = async (payload) => {
  try {
    const driver = getUserData("driver");
    console.log("driver from local storage", driver);

    const resp = await axios.put(API.DRIVER_UPDATE_PROFILE(driver.id), payload);
    return resp;
  } catch (err) {
    throw err;
  }
};

export const driverChangePassword = async (payload) => {
  try {
    const token = getUserToken("driver_token");
    const driver = getUserData("driver");
    const resp = await axios.post(
      API.DRIVER_CHANGE_PASSWORD(driver.id),
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
