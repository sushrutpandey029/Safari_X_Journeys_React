import { API } from "./apiEndpoints";
import axios from "axios";

export const fetchCoupons = async (id) => {
  return await axios.get(API.FETCH_COUPONS(id), {
    headers: { "Content-Type": "application/json" },
  });
};


  