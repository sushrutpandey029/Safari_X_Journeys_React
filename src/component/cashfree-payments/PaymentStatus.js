// import React, { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { getPaymentStatus } from "../services/paymentService";

// export default function PaymentStatus() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const [status, setStatus] = useState("loading");
//   const [message, setMessage] = useState("");
//   const [bookingId, setBookingId] = useState(null);

//   const orderId = searchParams.get("order_id");

//   useEffect(() => {
//     if (!orderId) {
//       setStatus("error");
//       setMessage("Invalid payment link");
//       return;
//     }

//     const fetchStatus = async () => {
//       try {
//         const res = await getPaymentStatus(orderId);
//         console.log("resp of payment status", res);

//         if (res.data.success) {
//           setStatus(res.data.status?.toLowerCase());
//           setMessage(res.data.message || "Payment processed successfully");
//           setBookingId(res.data.booking?.bookingId || res.data.bookingId);
//         } else {
//           setStatus("error");
//           setMessage(res.data.message || "Unable to fetch payment status");
//         }
//       } catch {
//         setStatus("error");
//         setMessage("Something went wrong while fetching payment status");
//       }
//     };

//     fetchStatus();
//   }, [orderId]);

//   const renderContent = () => {
//     if (status === "loading")
//       return <p className="text-gray-600">Checking your payment status...</p>;

//     if (status === "success")
//       return (
//         <div className="text-green-600">
//           <h2 className="text-2xl font-bold mb-2">Payment Successful ✅</h2>
//           <p>{message}</p>
//           {bookingId && (
//             <p className="mt-2">
//               Booking ID: <strong>{bookingId}</strong>
//             </p>
//           )}
//         </div>
//       );

//     if (status === "pending")
//       return (
//         <div className="text-yellow-600">
//           <h2 className="text-2xl font-bold mb-2">Payment Pending ⏳</h2>
//           <p>{message}</p>
//         </div>
//       );

//     if (status === "failed")
//       return (
//         <div className="text-red-600">
//           <h2 className="text-2xl font-bold mb-2">Payment Failed ❌</h2>
//           <p>{message}</p>
//         </div>
//       );

//     if (status === "error")
//       return (
//         <div className="text-orange-600">
//           <h2 className="text-2xl font-bold mb-2">Error</h2>
//           <p>{message}</p>
//         </div>
//       );
//   };

//   return (
//     <div
//       className="flex flex-col items-center justify-center min-h-screen px-4"
//       style={{ marginTop: "100px" }}
//     >
//       <div className="p-6 rounded-xl shadow-lg w-full max-w-md text-center">
//         {renderContent()}

//         <button
//           onClick={() => navigate("/")}
//           className="mt-6 mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Go to Home
//         </button>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPaymentStatus } from "../services/paymentService";
import { flight_getBookingDetails } from "../services/flightService";
import { handleDownloadInvoice } from "../utils/invoice";

const POLL_INTERVAL = 4000;
const MAX_RETRIES = 20;

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Core state
  const [status, setStatus] = useState("loading"); // payment status
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [serviceType, setServiceType] = useState(null);
  const [message, setMessage] = useState("");

  // Booking details (summary only)
  const [bookingDetails, setBookingDetails] = useState(null);

  // Polling
  const [retryCount, setRetryCount] = useState(0);
  const timerRef = useRef(null);

  const orderId = searchParams.get("order_id");

  /* -------------------- PAYMENT + BOOKING POLLING -------------------- */
  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      setMessage("Invalid payment link");
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await getPaymentStatus(orderId);

        if (!res.data.success) {
          setStatus("error");
          setMessage(res.data.message || "Unable to fetch payment status");
          return;
        }

        const paymentStatus = res.data.status?.toLowerCase();
        const booking = res.data.booking;

        setStatus(paymentStatus);
        setMessage(res.data.message || "");

        if (booking) {
          setBookingStatus(booking.status);
          setServiceType(booking.serviceType);
          setBookingId(booking.vendorBookingId || booking.bookingId);
        }

        // ⏳ Keep polling until booking resolves
        if (
          paymentStatus === "success" &&
          (booking?.status === "pending" || booking?.status === "processing") &&
          retryCount < MAX_RETRIES
        ) {
          timerRef.current = setTimeout(
            () => setRetryCount((c) => c + 1),
            POLL_INTERVAL
          );
        }

        // ✅ Fetch booking details ONCE after confirmation
        if (
          paymentStatus === "success" &&
          booking?.status === "confirmed" &&
          !bookingDetails
        ) {
          fetchBookingDetails(booking.serviceType, booking.vendorBookingId);
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Something went wrong while fetching status");
      }
    };

    fetchStatus();

    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [orderId, retryCount]);

  /* -------------------- FETCH BOOKING DETAILS -------------------- */
  const fetchBookingDetails = async (type, vendorBookingId) => {
    try {
      if (type === "flight") {
        const resp = await flight_getBookingDetails({
          BookingId: vendorBookingId,
        });
        setBookingDetails(resp.data);
      }
      // Future: bus / hotel / cab
    } catch (err) {
      console.error("Booking details fetch failed", err);
    }
  };

  /* -------------------- EXTRACT SUMMARY DATA -------------------- */
  const getSummaryData = () => {
    if (!bookingDetails) return {};

    if (serviceType === "flight") {
      const itin = bookingDetails?.data?.Response?.FlightItinerary || {};
      return {
        bookingStatus: "Confirmed",
        pnr: itin.PNR,
        invoiceNo: itin.InvoiceNo,
      };
    }

    return {
      bookingStatus: "Confirmed",
      pnr: null,
      invoiceNo: null,
    };
  };

  const buildInvoicePayload = () => {
    if (!bookingDetails || serviceType !== "flight") return null;

    const itin = bookingDetails?.data?.Response?.FlightItinerary;
    if (!itin) return null;

    const firstSegment = itin.Segments?.[0];
    const airline = firstSegment?.Airline;

    return {
      bookingId,
      PNR: itin.PNR,
      vendorBookingId: itin.BookingId,

      originCity:
        firstSegment?.Origin?.Airport?.CityName ||
        firstSegment?.Origin?.Airport?.AirportCode,

      destinationCity:
        firstSegment?.Destination?.Airport?.CityName ||
        firstSegment?.Destination?.Airport?.AirportCode,

      depTime: firstSegment?.Origin?.DepTime
        ? new Date(firstSegment.Origin.DepTime)
        : null,

      arrTime: firstSegment?.Destination?.ArrTime
        ? new Date(firstSegment.Destination.ArrTime)
        : null,

      airline,
      passengers: itin.Passenger || [],

      currency: itin.Fare?.Currency || "INR",
      totalAmount: itin.Fare?.PublishedFare,

      paymentInfo: {
        paymentMethod: "Online",
        paymentStatus: "Success",
      },
    };
  };

  /* -------------------- UI -------------------- */
  const renderContent = () => {
    if (status === "loading") {
      return <p className="text-gray-600">Checking payment status…</p>;
    }

    if (status === "error") {
      return <p className="text-red-600">{message}</p>;
    }

    if (status === "failed") {
      return <p className="text-red-600">Payment failed ❌</p>;
    }

    if (
      status === "success" &&
      (bookingStatus === "pending" || bookingStatus === "processing")
    ) {
      return (
        <div className="text-yellow-600">
          <h2 className="text-xl font-semibold">Payment Successful ✅</h2>
          <p className="mt-1">Confirming your booking…</p>
        </div>
      );
    }

    if (bookingStatus === "failed") {
      return (
        <p className="text-red-600">
          Booking failed after payment. Refund will be initiated.
        </p>
      );
    }

    if (bookingStatus === "confirmed" && bookingDetails) {
      const { bookingStatus, pnr, invoiceNo } = getSummaryData();

      return (
        <div className="space-y-4 text-left">
          <h2 className="text-2xl font-bold text-green-600">
            Booking Confirmed 🎉
          </h2>

          <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
            <p>
              <strong>Status:</strong>{" "}
              <span className="text-green-700">{bookingStatus}</span>
            </p>

            <p>
              <strong>Booking ID:</strong> {bookingId}
            </p>

            {pnr && (
              <p>
                <strong>PNR:</strong> {pnr}
              </p>
            )}

            {invoiceNo && (
              <p>
                <strong>Invoice No:</strong> {invoiceNo}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              const payload = buildInvoicePayload();
              if (!payload) return alert("Invoice data not ready");

              handleDownloadInvoice({
                serviceType,
                payload,
              });
            }}
            className="btn btn-primary btn-sm "
          >
            Download Invoice
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="flex justify-center mt-32 px-4"
      style={{ marginTop: "150px" }}
    >
      <div className="p-6 shadow-lg rounded-lg w-full max-w-md text-center bg-white">
        {renderContent()}
      </div>
    </div>
  );
}
