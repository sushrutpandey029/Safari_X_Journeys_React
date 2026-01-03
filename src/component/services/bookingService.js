import axios from "axios";
import { API } from "./apiEndpoints";
import { authHeaders } from "../utils/authHeaders";

export const downloadBookingPDF = async (bookingId) => {
  console.log("Download URL:", API.USER_DOWNLOAD_INVOICE(bookingId));
  const headers = await authHeaders();
  console.log("authhaders", headers);

  const response = await axios.get(API.USER_DOWNLOAD_INVOICE(bookingId), {
    headers,
    responseType: "blob",
  });

  return response.data;
};
