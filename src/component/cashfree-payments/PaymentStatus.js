
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPaymentStatus } from "../services/paymentService";
import { flight_getBookingDetails } from "../services/flightService";
 
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
        console.log("payment data", JSON.stringify(res.data, null, 2));
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
        console.log("resp payment", resp.data);
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
    if (bookingStatus === "confirmed") {
      const summary =
        serviceType === "flight" && bookingDetails
          ? getSummaryData()
          : {
              bookingStatus: "Confirmed",
              pnr: null,
              invoiceNo: null,
            };

      return (
        <div className="space-y-4 text-left">
          <h2 className="text-2xl font-bold text-green-600">
            Booking Confirmed 🎉
          </h2>

          <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
            <p>
              <strong>Status:</strong>{" "}
              <span className="text-green-700">{summary.bookingStatus}</span>
            </p>

            <p>
              <strong>Booking ID:</strong> {bookingId}
            </p>

            {summary.pnr && (
              <p>
                <strong>PNR:</strong> {summary.pnr}
              </p>
            )}

            {summary.invoiceNo && (
              <p>
                <strong>Invoice No:</strong> {summary.invoiceNo}
              </p>
            )}
          </div>

         
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
