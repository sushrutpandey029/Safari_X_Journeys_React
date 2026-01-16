// ✅ busservice.js
import axios from "axios";
import { API } from "./apiEndpoints";

// 🏙️ FETCH BUS CITY LIST
export const Bus_getCityList = async () => {
  try {
    const body = {
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
    if (!layoutData?.TraceId || layoutData?.ResultIndex === undefined) {
      console.log("❌ INVALID LAYOUT REQUEST DATA:", layoutData);
      return { status: false };
    }

    const body = {
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

// services/busservice.js
export const fetchBoardingPoints = async (TraceId, ResultIndex) => {
  const bodyData = {
    TraceId: TraceId?.trim(),
    ResultIndex: parseInt(ResultIndex),
  };

  try {
    const response = await axios.post(API.Bus_boardingPoints, bodyData, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Boarding Points API Error Details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // Specific error messages based on status code
    if (error.response?.status === 400) {
      throw new Error("Invalid parameters sent to server");
    } else if (error.response?.status === 404) {
      throw new Error("Boarding points not found for this bus");
    } else if (error.response?.status === 500) {
      throw new Error("Server error, please try again");
    } else {
      throw new Error(`API Error: ${error.message}`);
    }
  }
};

export const bus_getBookingDetails = async (payload) => {
  return await axios.post(API.Bus_getBookingDetails, payload, {
    headers: { "Content-Type": "application/json" },
  });
};

export const bus_sendChangeRequest = async (payload) => {
  return await axios.post(API.Bus_sendChangeRequest, payload, {
    headers: { "Content-Type": "application/json" },
  });
};
export const bus_getChangeRequestStatus = async (payload) => {
  return await axios.post(API.Bus_getChangeRequestStatus, payload, {
    headers: { "Content-Type": "application/json" },
  });
};
export const bus_block = async (payload) => {
  return await axios.post(API.Bus_block, payload, {
    headers: { "Content-Type": "application/json" },
  });
};
