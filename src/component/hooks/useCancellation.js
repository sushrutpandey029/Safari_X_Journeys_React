// import { useState } from "react";
// import {
//   flight_sendChangeRequest,
//   flight_getChangeRequestStatus,
// } from "../services/flightService";
// import {
//   bus_sendChangeRequest,
//   bus_getChangeRequestStatus,
// } from "../services/busservice";
// import { confirmBookingCancellation } from "../services/commonService";

// export default function useCancellation(serviceType) {
//   const [isCancelling, setIsCancelling] = useState(false);
//   const [cancelStatus, setCancelStatus] = useState(""); // idle | processing | success | failed | rejected
//   const [cancelMessage, setCancelMessage] = useState("");
//   const [cancelResult, setCancelResult] = useState(null);

//   const startCancellation = async ({ vendorBookingId, bookingId }) => {
//     if (!vendorBookingId || vendorBookingId === "N/A") {
//       alert("Vendor Booking ID missing");
//       return;
//     }

//     const confirmCancel = window.confirm(
//       "⚠ Are you sure you want to cancel?\nThis may include cancellation charges."
//     );
//     if (!confirmCancel) return;

//     setIsCancelling(true);
//     setCancelStatus("processing");
//     setCancelMessage(
//       `<div class="alert alert-warning">Submitting cancellation request to vendor...</div>`
//     );

//     try {
//       if (serviceType === "flight") {
//         const changeRequestPayload = {
//           EndUserIp: "192.168.1.11",
//           BookingId: vendorBookingId,
//           RequestType: 1,
//           CancellationType: 3,
//           Remarks: "User requested cancellation",
//         };

//         const resp = await flight_sendChangeRequest(changeRequestPayload);
//         console.log("resp of flight_sendChangeRequest", resp);
//         const changeRequestId =
//           resp?.data?.data?.Response?.TicketCRInfo?.[0]?.ChangeRequestId;
//         console.log("flight change requst id", changeRequestId);
//         if (!changeRequestId) {
//           setCancelStatus("failed");
//           setCancelMessage(
//             `<div class="alert alert-danger">ChangeRequestId missing — vendor failed</div>`
//           );
//           setIsCancelling(false);
//           return;
//         }

//         setCancelMessage(
//           `<div class="alert alert-info">⏳ Waiting for airline/vendor response...</div>`
//         );

//         // Poll every 5 sec with max attempts
//         let attempts = 0;
//         const maxAttempts = 20; // 100 seconds ~ 1.5 min

//         const pollInterval = setInterval(async () => {
//           attempts++;

//           setCancelMessage(
//             `<div class="alert alert-secondary">Checking cancellation progress... (Attempt ${attempts} of ${maxAttempts})</div>`
//           );

//           try {
//             const statusResp = await flight_getChangeRequestStatus({
//               EndUserIp: "192.168.1.11",
//               ChangeRequestId: changeRequestId,
//             });

//             console.log(
//               "status resp of flight_getChangeRequestStatus",
//               statusResp
//             );

//             const status =
//               statusResp?.data?.data?.Response?.ChangeRequestStatus;
//             const info = statusResp?.data?.data?.Response;
//             console.log("status of flight_getChangeRequestStatus", status);
//             // SUCCESS
//             // if (status === 4) { value will be 4 for success ,1 is for pending, 2/3 is for failed or rejected
//             if (status === 4) {
//               clearInterval(pollInterval);

//               const refund = info?.RefundedAmount;
//               const charge = info?.CancellationCharge;
//               const creditNote = info?.CreditNoteNo;

//               await confirmBookingCancellation({
//                 bookingId,
//                 refundAmount: refund,
//                 cancellationCharge: charge,
//                 creditNote,
//                 vendorResponse: info,
//               });

//               setCancelResult({ refund, charge, creditNote });
//               setCancelStatus("success");
//               setCancelMessage(
//                 `<div class="alert alert-success">✔ Cancelled successfully! Refund: ₹${refund}, Charge: ₹${charge}</div>`
//               );
//               setIsCancelling(false);
//             }
//             // REJECTED or FAILED
//             else if (status === 2 || status === 3) {
//               clearInterval(pollInterval);
//               setCancelStatus("rejected");
//               setCancelMessage(
//                 `<div class="alert alert-danger">❌ Cancellation rejected or failed</div>`
//               );
//               setIsCancelling(false);
//             }
//             // TIMEOUT
//             else if (attempts >= maxAttempts) {
//               clearInterval(pollInterval);
//               setCancelStatus("failed");
//               setCancelMessage(
//                 `<div class="alert alert-warning">⏳ Airline is taking longer than usual. Please check again later!</div>`
//               );
//               setIsCancelling(false);
//             }
//           } catch (err) {
//             clearInterval(pollInterval);
//             console.error("Polling error:", err);
//             setCancelStatus("failed");
//             setCancelMessage(
//               `<div class="alert alert-danger">⚠ Error checking cancellation status</div>`
//             );
//             setIsCancelling(false);
//           }
//         }, 5000);
//       }
//     } catch (error) {
//       console.error(error);
//       setCancelStatus("failed");
//       setCancelMessage(
//         `<div class="alert alert-danger">Cancellation failed</div>`
//       );
//       setIsCancelling(false);
//     }
//   };

//   return {
//     isCancelling,
//     cancelStatus,
//     cancelMessage,
//     cancelResult,
//     startCancellation,
//   };
// }

// useCancellation.js

import { useState } from "react";
import {
  flight_sendChangeRequest,
  flight_getChangeRequestStatus,
} from "../services/flightService";

import {
  bus_sendChangeRequest,
  bus_getChangeRequestStatus,
} from "../services/busservice";

import { confirmBookingCancellation } from "../services/commonService";
import { useNavigate } from "react-router-dom";

export default function useCancellation(serviceType) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelStatus, setCancelStatus] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelResult, setCancelResult] = useState(null);

  const navigate = useNavigate();

  // --------------------------------------------------
  // MAIN CANCELLATION HANDLER FOR BOTH FLIGHT & BUS
  // --------------------------------------------------
  const startCancellation = async ({ vendorBookingId, bookingId, TraceId }) => {
    console.log("vendorbookingid", vendorBookingId);
    console.log("bookingId", bookingId);
    if (!vendorBookingId) {
      alert("Vendor Booking ID missing");
      return;
    }

    const confirmCancel = window.confirm(
      "⚠ Are you sure you want to cancel?\nThis may include cancellation charges."
    );
    if (!confirmCancel) return;

    setIsCancelling(true);
    setCancelStatus("processing");
    setCancelMessage("Submitting cancellation request to vendor...");

    try {
      // ------------------------------------------------
      // ✈ FLIGHT CANCELLATION
      // ------------------------------------------------
      if (serviceType === "flight") {
        return await handleFlightCancellation(vendorBookingId, bookingId);
      }

      // ------------------------------------------------
      // 🚌 BUS CANCELLATION
      // ------------------------------------------------
      if (serviceType === "bus") {
        return await handleBusCancellation(vendorBookingId, bookingId, TraceId);
      }
    } catch (err) {
      console.error("Cancellation Error:", err);
      setCancelStatus("failed");
      setCancelMessage("❌ Cancellation failed. Try again later.");
    }

    setIsCancelling(false);
  };

  // --------------------------------------------------
  // ✈ FLIGHT CANCELLATION FLOW
  // --------------------------------------------------
  const handleFlightCancellation = async (vendorBookingId, bookingId) => {
    const payload = {
      EndUserIp: "192.168.1.11",
      BookingId: vendorBookingId,
      RequestType: 1,
      CancellationType: 3,
      Remarks: "User requested cancellation",
    };

    const resp = await flight_sendChangeRequest(payload);

    const changeRequestId =
      resp?.data?.data?.Response?.TicketCRInfo?.[0]?.ChangeRequestId;

    if (!changeRequestId) {
      setCancelStatus("failed");
      setCancelMessage("Vendor rejected cancellation");
      return;
    }

    return await pollFlightCancellation(changeRequestId, bookingId);
  };

  const pollFlightCancellation = async (changeRequestId, bookingId) => {
    let attempts = 0;
    const maxAttempts = 20;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const resp = await flight_getChangeRequestStatus({
          EndUserIp: "192.168.1.11",
          ChangeRequestId: changeRequestId,
        });

        const status = resp?.data?.data?.Response?.ChangeRequestStatus;
        const info = resp?.data?.data?.Response;

        // SUCCESS
        if (status === 4) {
          clearInterval(pollInterval);

          const refund = info?.RefundedAmount;
          const charge = info?.CancellationCharge;
          const creditNote = info?.CreditNoteNo;

          await confirmBookingCancellation({
            bookingId,
            refundAmount: refund,
            cancellationCharge: charge,
            creditNote,
            vendorResponse: info,
          });

          setCancelResult({ refund, charge, creditNote });
          setCancelStatus("success");
          setCancelMessage("✔ Cancellation successful!");
          setIsCancelling(false);
        }

        // FAILED / REJECTED
        else if (status === 2 || status === 3) {
          clearInterval(pollInterval);
          setCancelStatus("failed");
          setCancelMessage("❌ Cancellation rejected");
          setIsCancelling(false);
        }

        // TIMEOUT
        else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setCancelStatus("failed");
          setCancelMessage("⏳ Vendor timeout. Try later.");
          setIsCancelling(false);
        }
      } catch (err) {
        clearInterval(pollInterval);
        setCancelStatus("failed");
        setCancelMessage("❌ Error checking cancellation status");
        setIsCancelling(false);
      }
    }, 5000);
  };

  // --------------------------------------------------
  // 🚌 BUS CANCELLATION FLOW
  // --------------------------------------------------
  const handleBusCancellation = async (vendorBookingId, bookingId, TraceId) => {
    const payload = {
      //   EndUserIp: "192.168.1.11",
      //   TokenId: window.localStorage.getItem("busToken"), // or use serviceDetails
      BusId: vendorBookingId,
      RequestType: 11, // FIXED for bus cancellation
      Remarks: "User requested cancellation",
      bookingId,
    };

    const resp = await bus_sendChangeRequest(payload);

    console.log("🚌 Bus SendChangeRequest Resp:", resp.data);

    const changeRequestId = resp?.data?.busCRInfo?.[0]?.ChangeRequestId;

    if (!changeRequestId) {
      setCancelStatus("failed");
      setCancelMessage("Vendor rejected cancellation");
      return;
    }

    return await pollBusCancellation(
      changeRequestId,
      //   payload.TokenId,
      bookingId,
      TraceId
    );
  };

  const pollBusCancellation = async (changeRequestId, bookingId, TraceId) => {
    let attempts = 0;
    const maxAttempts = 20;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const resp = await bus_getChangeRequestStatus({
          //   EndUserIp: "192.168.1.11",
          TraceId, // TBO requires but not mandatory for polling
          //   TokenId: tokenId,
          bookingId,
          ClientId: "ApiIntegrationNew",
          ChangeRequestId: [changeRequestId],
        });

        const info = resp?.data?.busCRInfo?.[0];
        const status = info ? 4 : 1; // TBO bus has no explicit status code

        // SUCCESS — bus returns refund & cancellationCharge directly
        if (info?.cancellationCharge !== undefined) {
          clearInterval(pollInterval);

          const refund = info?.refundedAmount;
          const charge = info?.cancellationCharge;
          const creditNote = info?.creditNoteNo;

          await confirmBookingCancellation({
            bookingId,
            refundAmount: refund,
            cancellationCharge: charge,
            creditNote,
            vendorResponse: info,
          });

          setCancelResult({ refund, charge, creditNote });
          setCancelStatus("success");
          setCancelMessage("✔ Bus cancelled successfully!");
          setIsCancelling(false);
          navigate("/user-dashboard");
        }

        // TIMEOUT
        else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setCancelStatus("failed");
          setCancelMessage("⏳ Vendor timeout.");
          setIsCancelling(false);
        }
      } catch (err) {
        clearInterval(pollInterval);
        setCancelStatus("failed");
        setCancelMessage("❌ Error in bus cancellation");
        setIsCancelling(false);
      }
    }, 5000);
  };

  return {
    isCancelling,
    cancelStatus,
    cancelMessage,
    cancelResult,
    startCancellation,
  };
}
