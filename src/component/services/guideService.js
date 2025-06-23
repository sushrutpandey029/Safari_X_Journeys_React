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
