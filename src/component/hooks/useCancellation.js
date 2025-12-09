// import { useState } from "react";
// import {
//   flight_sendChangeRequest,
//   flight_getChangeRequestStatus,
// } from "../services/flightService";
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
//     setCancelMessage("Submitting cancellation request to vendor...");

//     try {
//       // 🔹 Flight service
//       if (serviceType === "flight") {
//         const changeRequestPayload = {
//           EndUserIp: "192.168.1.11",
//           BookingId: vendorBookingId,
//           RequestType: 1,
//           CancellationType: 3,
//           Remarks: "User requested cancellation",
//         };
//         console.log("before flight send change request", changeRequestPayload);

//         const resp = await flight_sendChangeRequest(changeRequestPayload);
//         console.log("resp after flght send change requset", resp);
//         const changeRequestId =
//           resp?.data?.data?.Response?.TicketCRInfo?.[0]?.ChangeRequestId;
//         console.log("changeRequestId", changeRequestId);
//         if (!changeRequestId) {
//           setCancelStatus("failed");
//           setCancelMessage("ChangeRequestId missing — vendor failed");
//           setIsCancelling(false);
//           return;
//         }

//         setCancelMessage("⏳ Waiting for airline/ vendor response...");

//         // Poll every 5 sec
//         const pollInterval = setInterval(async () => {
//           try {
//             const statusResp = await flight_getChangeRequestStatus({
//               EndUserIp: "192.168.1.11",
//               ChangeRequestId: changeRequestId,
//             });
//             console.log("status resp after flight get change request state",statusResp)

//             const status =
//               statusResp?.data?.data?.Response?.ChangeRequestStatus;
//             const info = statusResp?.data?.data?.Response;
//             console.log("status after change request status",status)

//             if (status === 4) {
//               clearInterval(pollInterval);

//               const refund = info?.RefundedAmount;
//               const charge = info?.CancellationCharge;
//               const creditNote = info?.CreditNoteNo;

//             const resp =  await confirmBookingCancellation({
//                 bookingId,
//                 refundAmount: refund,
//                 cancellationCharge: charge,
//                 creditNote,
//                 vendorResponse: info,
//               });
//               console.log("resp of confirm booking cancel",resp)

//               setCancelResult({ refund, charge, creditNote });
//               setCancelStatus("success");
//               setCancelMessage("✔ Cancelled successfully");
//               setIsCancelling(false);
//             } else if (status === 2 || status === 3) {
//               clearInterval(pollInterval);
//               setCancelStatus("rejected");
//               setCancelMessage("❌ Cancellation rejected");
//               setIsCancelling(false);
//             }
//           } catch (err) {
//             console.error(err);
//           }
//         }, 5000);
//       }

//       // FUTURE ADDITION:
//       if (serviceType === "hotel") {
//         // sendChangeRequestHotel();
//       }

//       if (serviceType === "bus") {
//         // cancelBus();
//       }
//     } catch (error) {
//       console.error(error);
//       setCancelStatus("failed");
//       setCancelMessage("Cancellation failed");
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

import { useState } from "react";
import {
  flight_sendChangeRequest,
  flight_getChangeRequestStatus,
} from "../services/flightService";
import { confirmBookingCancellation } from "../services/commonService";

export default function useCancellation(serviceType) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelStatus, setCancelStatus] = useState(""); // idle | processing | success | failed | rejected
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelResult, setCancelResult] = useState(null);

  const startCancellation = async ({ vendorBookingId, bookingId }) => {
    if (!vendorBookingId || vendorBookingId === "N/A") {
      alert("Vendor Booking ID missing");
      return;
    }

    const confirmCancel = window.confirm(
      "⚠ Are you sure you want to cancel?\nThis may include cancellation charges."
    );
    if (!confirmCancel) return;

    setIsCancelling(true);
    setCancelStatus("processing");
    setCancelMessage(
      `<div class="alert alert-warning">Submitting cancellation request to vendor...</div>`
    );

    try {
      if (serviceType === "flight") {
        const changeRequestPayload = {
          EndUserIp: "192.168.1.11",
          BookingId: vendorBookingId,
          RequestType: 1,
          CancellationType: 3,
          Remarks: "User requested cancellation",
        };

        const resp = await flight_sendChangeRequest(changeRequestPayload);

        const changeRequestId =
          resp?.data?.data?.Response?.TicketCRInfo?.[0]?.ChangeRequestId;

        if (!changeRequestId) {
          setCancelStatus("failed");
          setCancelMessage(
            `<div class="alert alert-danger">ChangeRequestId missing — vendor failed</div>`
          );
          setIsCancelling(false);
          return;
        }

        setCancelMessage(
          `<div class="alert alert-info">⏳ Waiting for airline/vendor response...</div>`
        );

        // Poll every 5 sec with max attempts
        let attempts = 0;
        const maxAttempts = 20; // 100 seconds ~ 1.5 min

        const pollInterval = setInterval(async () => {
          attempts++;

          setCancelMessage(
            `<div class="alert alert-secondary">Checking cancellation progress... (Attempt ${attempts} of ${maxAttempts})</div>`
          );

          try {
            const statusResp = await flight_getChangeRequestStatus({
              EndUserIp: "192.168.1.11",
              ChangeRequestId: changeRequestId,
            });

            const status =
              statusResp?.data?.data?.Response?.ChangeRequestStatus;
            const info = statusResp?.data?.data?.Response;

            // SUCCESS
            // if (status === 4) { value will be 4 for success ,1 is for pending, 2/3 is for failed or rejected
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
              setCancelMessage(
                `<div class="alert alert-success">✔ Cancelled successfully! Refund: ₹${refund}, Charge: ₹${charge}</div>`
              );
              setIsCancelling(false);
            }
            // REJECTED or FAILED
            else if (status === 2 || status === 3) {
              clearInterval(pollInterval);
              setCancelStatus("rejected");
              setCancelMessage(
                `<div class="alert alert-danger">❌ Cancellation rejected or failed</div>`
              );
              setIsCancelling(false);
            }
            // TIMEOUT
            else if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setCancelStatus("failed");
              setCancelMessage(
                `<div class="alert alert-warning">⏳ Airline is taking longer than usual. Please check again later!</div>`
              );
              setIsCancelling(false);
            }
          } catch (err) {
            clearInterval(pollInterval);
            console.error("Polling error:", err);
            setCancelStatus("failed");
            setCancelMessage(
              `<div class="alert alert-danger">⚠ Error checking cancellation status</div>`
            );
            setIsCancelling(false);
          }
        }, 5000);
      }
    } catch (error) {
      console.error(error);
      setCancelStatus("failed");
      setCancelMessage(
        `<div class="alert alert-danger">Cancellation failed</div>`
      );
      setIsCancelling(false);
    }
  };

  return {
    isCancelling,
    cancelStatus,
    cancelMessage,
    cancelResult,
    startCancellation,
  };
}
