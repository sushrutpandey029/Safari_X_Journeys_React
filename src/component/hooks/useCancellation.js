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
import { toast } from "react-toastify";

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
      "⚠ Are you sure you want to cancel?\nThis may include cancellation charges.",
    );
    if (!confirmCancel) return;

    setIsCancelling(true);
    setCancelStatus("processing");
    setCancelMessage("Submitting cancellation request to vendor...");
    toast.warning("Submitting cancellation request...");

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
    pollFlightCancellation(changeRequestId, bookingId);

    // return await pollFlightCancellation(changeRequestId, bookingId);
  };
  const pollFlightCancellation = async (
    changeRequestId,
    bookingId,
    attempt = 1,
  ) => {
    console.log("Flight polling attempt:", attempt);

    const maxAttempts = 24; // 2 minutes timeout

    // STOP after timeout
    if (attempt > maxAttempts) {
      const msg =
        "Cancellation is taking longer than expected. Please check later.";

      setCancelStatus("failed");
      setCancelMessage(msg);
      setIsCancelling(false);

      toast.error(msg);

      return;
    }

    try {
      const resp = await flight_getChangeRequestStatus({
        EndUserIp: "192.168.1.11",
        ChangeRequestId: changeRequestId,
      });

      const status = resp?.data?.data?.Response?.ChangeRequestStatus;
      const info = resp?.data?.data?.Response;

      console.log("Flight cancellation status:", status);

      // ⏳ PROCESSING
      if (status === 1) {
        setCancelMessage("⏳ Cancellation is being processed...");

        setTimeout(() => {
          pollFlightCancellation(changeRequestId, bookingId, attempt + 1);
        }, 5000);

        return;
      }

      // ✅ SUCCESS
      if (status === 4) {
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

        const msg = "Flight booking cancelled successfully.";

        setCancelResult({ refund, charge, creditNote });
        setCancelStatus("success");
        setCancelMessage(msg);
        setIsCancelling(false);

        toast.success(msg);

        setTimeout(() => {
          navigate(0);
        }, 2500);

        return;
      }

      // ❌ REJECTED
      if (status === 2 || status === 3) {
        const msg = "Cancellation rejected by airline.";

        setCancelStatus("failed");
        setCancelMessage(msg);
        setIsCancelling(false);

        toast.error(msg);

        return;
      }
    } catch (err) {
      const msg = "Error checking cancellation status.";

      setCancelStatus("failed");
      setCancelMessage(msg);
      setIsCancelling(false);

      toast.error(msg);
    }
  };

  // const pollFlightCancellation = async (changeRequestId, bookingId) => {
  //   let attempts = 0;
  //   const maxAttempts = 20;

  //   const pollInterval = setInterval(async () => {
  //     attempts++;

  //     try {
  //       const resp = await flight_getChangeRequestStatus({
  //         EndUserIp: "192.168.1.11",
  //         ChangeRequestId: changeRequestId,
  //       });

  //       const status = resp?.data?.data?.Response?.ChangeRequestStatus;
  //       const info = resp?.data?.data?.Response;

  //       // SUCCESS
  //       if (status === 4) {
  //         clearInterval(pollInterval);

  //         const refund = info?.RefundedAmount;
  //         const charge = info?.CancellationCharge;
  //         const creditNote = info?.CreditNoteNo;

  //         await confirmBookingCancellation({
  //           bookingId,
  //           refundAmount: refund,
  //           cancellationCharge: charge,
  //           creditNote,
  //           vendorResponse: info,
  //         });

  //         setCancelResult({ refund, charge, creditNote });
  //         setCancelStatus("success");
  //         setCancelMessage("✔ Cancellation successful!");
  //         setIsCancelling(false);
  //         toast.success("Flight booking cancelled successfully");  // ✅ ADD
  //       }

  //       // FAILED / REJECTED
  //       else if (status === 2 || status === 3) {
  //         clearInterval(pollInterval);
  //         setCancelStatus("failed");
  //         setCancelMessage("❌ Cancellation rejected");
  //         setIsCancelling(false);
  //         toast.error("Cancellation rejected by airline");  // ✅ ADD
  //       }

  //       // TIMEOUT
  //       else if (attempts >= maxAttempts) {
  //         clearInterval(pollInterval);
  //         setCancelStatus("failed");
  //         setCancelMessage("⏳ Vendor timeout. Try later.");
  //         setIsCancelling(false);
  //       }
  //     } catch (err) {
  //       clearInterval(pollInterval);
  //       setCancelStatus("failed");
  //       setCancelMessage("❌ Error checking cancellation status");
  //       setIsCancelling(false);
  //     }
  //   }, 5000);
  // };

  // --------------------------------------------------
  // 🚌 BUS CANCELLATION FLOW
  // --------------------------------------------------

  const handleBusCancellation = async (vendorBookingId, bookingId, TraceId) => {
    const payload = {
      BusId: vendorBookingId,
      RequestType: 11, // FIXED for bus cancellation
      Remarks: "User requested cancellation",
      bookingId,
    };

    const resp = await bus_sendChangeRequest(payload);

    console.log("🚌 Bus SendChangeRequest Resp:", resp.data);

    // ✅  Check vendor error
    if (resp?.data?.error?.ErrorCode && resp.data.error.ErrorCode !== 0) {
      setCancelStatus("failed");

      setCancelMessage(
        resp.data.error.ErrorMessage ||
          "Cancellation could not be processed. Please contact support.",
      );

      setIsCancelling(false);
      toast.error(
        "Cancellation could not be processed. Please contact support.",
      );
      return;
    }

    const changeRequestId = resp?.data?.busCRInfo?.[0]?.ChangeRequestId;

    if (!changeRequestId) {
      setCancelStatus("failed");
      setCancelMessage("Vendor rejected cancellation");
      setIsCancelling(false);
      toast.error("Vendor rejected cancellation");
      return;
    }

    return await pollBusCancellation(changeRequestId, bookingId, TraceId);
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
          setCancelMessage(
            "✔ Bus booking cancelled successfully. Updating your booking status...",
          );
          setIsCancelling(false);
          toast.success("Booking cancelled successfully");

          // navigate("/user-dashboard");
          // delay navigation to allow user to see message
          setTimeout(() => {
            navigate(0); // refresh current page
          }, 2500);
        }

        // TIMEOUT
        else if (attempts >= maxAttempts) {
          const msg = "Vendor timeout. Please try again later.";
          clearInterval(pollInterval);
          setCancelStatus("failed");
          setCancelMessage(msg);
          setIsCancelling(false);
          toast.error(msg);
        }
      } catch (err) {
        clearInterval(pollInterval);
        const msg = "Error in bus cancellation. Please try again.";
        setCancelMessage(msg);
        setCancelMessage("❌ Error in bus cancellation");
        setIsCancelling(false);
        toast.error(msg);
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
