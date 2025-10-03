// src/component/services/flightService.js
import axios from "axios";
import { API } from "./apiEndpoints";

export const getIndianAirports = async () => {
  try {
    const resp = await axios.get(API.Flight_Indian_Airports);
    console.log("API Response in indian airport:", resp.data);
    return resp.data || { status: false, data: [] };
  } catch (err) {
    console.log("Error in getIndianAirports:", err);
    return { status: false, data: [] };
  }
};
