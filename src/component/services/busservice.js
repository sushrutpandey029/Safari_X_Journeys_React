// ✅ busservice.js
import axios from "axios";
import { API } from "./apiEndpoints"; 

// 🧠 AUTHENTICATE BUS API
export const Bus_authenticate = async () => {
  try {
    const body = {
      ClientId: "ApiIntegrationNew",
      UserName: "SAFARIX",
      Password: "SAFARIX@123",
    };

    const response = await axios.post(API.Bus_Authenticate, body);
    console.log("✅ Bus_Authenticate Response:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ Error in Bus_Authenticate:", err);
    return { status: false };
  }
};

// 🏙️ FETCH BUS CITY LIST
export const Bus_getCityList = async (tokenId) => {
  try {
    const body = {
      TokenId: tokenId,
      ClientId: "ApiIntegrationNew",
    };

    const response = await axios.post(API.Bus_getcitylist, body);
    console.log("✅ Bus_getCityList Response:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ Error in Bus_getCityList:", err);
    return { status: false };
  }
};

// 🚌 SEARCH BUSES

export const Bus_busSearch = async (searchData) => {
  try {
    const body = {
      TokenId: searchData.TokenId,
      DateOfJourney: searchData.DateOfJourney,
      OriginId: searchData.OriginId,
      DestinationId: searchData.DestinationId,
      PreferredCurrency: searchData.PreferredCurrency || "INR",
    };

    const response = await axios.post(API.Bus_searchbus, body);
    console.log("✅ Bus_busSearch Response:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ Error in Bus_busSearch:", err);
    return { status: false };
  }
};
