import axios from "axios";
import { API } from "./apiEndpoints";

export const getPaymentStatus = async (orderId) => {
  try {
    console.log("order id before GET_PAYMENT_STATUS", orderId);
    const resp = await axios.get(API.GET_PAYMENT_STATUS(orderId));
    console.log("get payment status resp", resp);
    return resp;
  } catch (err) {
    throw err;
  }
};
