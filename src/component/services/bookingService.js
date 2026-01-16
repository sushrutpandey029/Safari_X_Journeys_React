import axios from "axios";
import { API } from "./apiEndpoints";
import { authHeaders } from "../utils/authHeaders";

export const downloadBookingPDF = async (bookingId,vendorBookingId) => {
  const headers = await authHeaders();

  const response = await axios.get(API.USER_DOWNLOAD_INVOICE(bookingId,vendorBookingId), {
    headers,
    responseType: "blob",
  });

  return response.data;
};
