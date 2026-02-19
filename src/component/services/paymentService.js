import axios from "axios";
import { API } from "./apiEndpoints";

export const getPaymentStatus = async (orderId) => {
  try {
    const resp = await axios.get(API.GET_PAYMENT_STATUS(orderId));
    return resp;
  } catch (err) {
    throw err;
  }
};
