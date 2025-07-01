import axios from "axios";
import { API } from "./apiEndpoints";

export const fetchCabList = async () => {
  try {
    const response = await axios.get(API.CAB_LIST);
    return response.data;
  } catch (error) {
    throw error;
  }
};
