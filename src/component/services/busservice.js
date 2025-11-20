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

export const Bus_busLayout = async (layoutData) => {
  try {
    if (!layoutData?.TokenId || !layoutData?.TraceId || layoutData?.ResultIndex === undefined) {
      console.log("❌ INVALID LAYOUT REQUEST DATA:", layoutData);
      return { status: false };
    }

    const body = {
      TokenId: layoutData.TokenId,
      TraceId: layoutData.TraceId,
      ResultIndex: layoutData.ResultIndex,
    };

    console.log("🔍 Hitting URL:", API.Bus_busLayout);
    console.log("📦 Sending Body:", body);

    const response = await axios.post(API.Bus_busLayout, body);
    console.log("✅ Bus_busLayout Response:", response.data);
    return response.data;

  } catch (err) {
    console.error("❌ Error in Bus_busLayout:", err);
    return { status: false };
  }
};


export const fetchBoardingPoints = async (TokenId, TraceId, ResultIndex) => {
  const bodyData = {
    TokenId,
    TraceId,
    ResultIndex,
  };

  try {
    const response = await axios.post(API.Bus_boardingPoints, bodyData);
    return response.data;
  } catch (error) {
    console.error("Boarding Points API Error:", error);
    throw error;
  }
};