// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { load } from "@cashfreepayments/cashfree-js";
// import { API } from "../services/apiEndpoints";

// export default function useCashfreePayment() {
//   const [cashfree, setCashfree] = useState(null);
//   const orderIdRef = useRef(null);

//   useEffect(() => {
//     async function initSDK() {
//       const cf = await load({ mode: "sandbox" }); // switch to "production" later
//       setCashfree(cf);
//     }
//     initSDK();
//   }, []);

//   // 🔹 Step 1: Create booking draft first, then initiate payment
//   const getSessionId = async (bookingData = {}) => {
//     try {
//       // 1️⃣ Create booking draft
//       const draftRes = await axios.post(API.CREATE_BOOKING_DRAFT, bookingData, {
//         headers: { "Content-Type": "application/json" },
//       });
//       console.log("draftRes", draftRes);
//       if (!draftRes.data.success) {
//         console.log("Failed to create booking draft");
//         return null;
//       }
//       const bookingId = draftRes.data.booking.bookingId;
//       console.log("booking data", bookingData);

//       // 2️⃣ Initiate payment using bookingId
//       const payRes = await axios.post(API.INITIATE_PAYMENT, {
//         bookingId,
//       });
//       console.log("parRes", payRes);
//       if (payRes.data && payRes.data.paymentSessionId) {
//         // const newOrderId = payRes.data.cashfreeOrderId;
//         // setOrderId(newOrderId);
//         // return {
//         //   sessionId: payRes.data.paymentSessionId,
//         //   orderId: newOrderId,
//         // };
//         orderIdRef.current = payRes.data.cashfreeOrderId;
//         return {
//           sessionId: payRes.data.paymentSessionId,
//           orderId: orderIdRef.current,
//         };
//       }

//       console.error("Failed to get payment session");
//       return null;
//     } catch (error) {
//       console.error("Error in getSessionId flow", error);
//       return null;
//     }
//   };

//   // const verifyPayment = async (orderIdParam) => {
//   //   console.log("orderidparam befor call api", orderIdParam);
//   //   try {
//   //     const res = await axios.post(API.CHECK_PAYMENT_STATUS, {
//   //       orderId: orderIdParam || orderId,
//   //     });
//   //     console.log("verifying payment resp", res.data);
//   //     return res.data;
//   //   } catch (error) {
//   //     console.error("Error verifying payment", error);
//   //   }
//   // };

//   const verifyPayment = async (orderIdParam) => {
//     console.log("orderidparam before call api", orderIdParam);
//     try {
//       const res = await axios.post(API.CHECK_PAYMENT_STATUS, {
//         orderId: orderIdParam || orderIdRef.current,
//       });
//       console.log("verifying payment resp", res.data);
//       return res.data;
//     } catch (error) {
//       console.error("Error verifying payment", error);
//     }
//   };

//   const startPayment = async (bookingData = {}) => {
//     if (!cashfree) {
//       console.error("Cashfree SDK not loaded yet");
//       return;
//     }

//     const sessionData = await getSessionId(bookingData);

//     if (!sessionData) return;
//     // const { sessionId, orderId: newOrderId } = sessionData;
//     // console.log("session id", sessionId, "orderId", newOrderId);
//     // console.log(" new orderid", newOrderId);
//     const { sessionId, orderId: newOrderId } = sessionData;
//     console.log("session id", sessionId, "orderId", newOrderId);

//     const checkoutOptions = {
//       paymentSessionId: sessionId,
//     };

//     const cashfreeResp = await cashfree.checkout(checkoutOptions);
//     console.log("cashfreeResp", cashfreeResp);
//     console.log("orderid before verifypayment", orderIdRef.current);
//     return await verifyPayment(orderIdRef.current);
//   };

//   return {
//     startPayment,
//     verifyPayment,
//   };
// }

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { load } from "@cashfreepayments/cashfree-js";
import { API } from "../services/apiEndpoints";

export default function useCashfreePayment() {
  const [cashfree, setCashfree] = useState(null);
  const orderIdRef = useRef(null); // ✅ persistent storage

  // Load Cashfree SDK once
  useEffect(() => {
    async function initSDK() {
      const cf = await load({ mode: "sandbox" }); // change to "production" later
      setCashfree(cf);
    }
    initSDK();
  }, []);

  // 🔹 Step 1: Create booking draft + initiate payment
  const getSessionId = async (bookingData = {}) => {
    try {
      // 1️⃣ Create booking draft
      const draftRes = await axios.post(API.CREATE_BOOKING_DRAFT, bookingData, {
        headers: { "Content-Type": "application/json" },
      });

      if (!draftRes.data.success) {
        console.error("❌ Failed to create booking draft");
        return null;
      }

      const bookingId = draftRes.data.booking.bookingId;

      // 2️⃣ Initiate payment
      const payRes = await axios.post(API.INITIATE_PAYMENT, { bookingId });

      if (payRes.data?.paymentSessionId && payRes.data?.cashfreeOrderId) {
        orderIdRef.current = payRes.data.cashfreeOrderId; // ✅ save persistently
        return {
          sessionId: payRes.data.paymentSessionId,
          orderId: payRes.data.cashfreeOrderId,
        };
      }

      console.error("❌ Failed to get payment session");
      return null;
    } catch (error) {
      console.error("Error in getSessionId", error);
      return null;
    }
  };

  // 🔹 Step 2: Verify payment status
  const verifyPayment = async (explicitOrderId) => {
    const orderId = explicitOrderId || orderIdRef.current;
    if (!orderId) {
      console.error("❌ No orderId found for verification");
      return null;
    }

    try {
      const res = await axios.post(API.CHECK_PAYMENT_STATUS, { orderId });
      console.log("✅ verifyPayment response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error verifying payment", error);
      return null;
    }
  };

  // 🔹 Step 3: Start full payment flow
  const startPayment = async (bookingData = {}) => {
    if (!cashfree) {
      console.error("❌ Cashfree SDK not loaded yet");
      return null;
    }

    const sessionData = await getSessionId(bookingData);
    if (!sessionData) return null;

    const { sessionId, orderId } = sessionData;

    try {
      const cfResp = await cashfree.checkout({ paymentSessionId: sessionId });
      console.log("Cashfree checkout response:", cfResp);

      // ✅ Explicitly verify using orderId
      return await verifyPayment(orderId);
    } catch (err) {
      console.error("Error during checkout", err);
      return null;
    }
  };

  return {
    startPayment,
    verifyPayment,
  };
}
