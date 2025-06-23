import { API } from "./apiEndpoints";
import axios from "axios";

export const getBannerData = async () => {
  try {
    const response = await axios.get(API.BANNER_IMAGE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchFaqList = async () => {
  try {
    const response = await axios.get(API.FAQ_LIST);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchBlog = async () => {
  try {
    const response = await axios.get(API.BLOGS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const contactUs = async (formData) => {
  try {
    const response = await axios.post(API.CONTACT_US,formData);
    return response.data;
  } catch (err) {
    throw err;
  }
};
