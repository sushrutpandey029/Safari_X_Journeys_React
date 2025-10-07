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
export const Flight_authenticate = async (endUserIp) => {
  try {
    const body = {
      ClientId: "ApiIntegrationNew",
      UserName: "SAFARIX",
      Password: "SAFARIX@123",
      EndUserIp: endUserIp,
    };

    const response = await axios.post(API.Flight_authenticate, body);
    console.log("Flight_authenticate Response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error in Flight_authenticate:", err);
    return { status: false };
  }
};

// ✅ Flight Search API
export const Flight_search = async (searchData) => {
  try {
    const resp = await axios.post(API.flight_search, searchData, {
      headers: { "Content-Type": "application/json" } // ensure JSON headers
    });

    console.log("✅ API Response in Flight_search:", resp.data);
    return resp.data || { status: false, data: [] };

  } catch (err) {
    console.error("❌ Error in Flight_search:", err);
    return { status: false, data: [] };
  }
};
