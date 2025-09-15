import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPaymentStatus } from "../services/paymentService";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [bookingId, setBookingId] = useState(null);

  const orderId = searchParams.get("order_id"); // ✅ only order_id now

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      setMessage("Invalid payment link");
      return;
    }

    const fetchStatus = async () => {
      try {
        console.log("orderid before getPaymentStatus", orderId);
        const res = await getPaymentStatus(orderId);
        console.log("res in payment", res);

        if (res.data.success) {
          setStatus(res.data.status?.toLowerCase()); // "success", "failed", "pending"
          setMessage(res.data.message || "Payment processed successfully");

          // ✅ bookingId comes from API response
          setBookingId(res.data.booking?.bookingId || res.data.bookingId);
        } else {
          setStatus("error");
          setMessage(res.data.message || "Unable to fetch payment status");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong while fetching payment status");
      }
    };
    fetchStatus();
  }, [orderId]);

  const renderContent = () => {
    if (status === "loading") {
      return <p className="text-gray-600">Checking your payment status...</p>;
    }
    if (status === "success") {
      return (
        <div className="text-green-600">
          <h2 className="text-2xl font-bold mb-2">Payment Successful ✅</h2>
          <p>{message}</p>
          {bookingId && (
            <p className="mt-2">
              Booking ID: <strong>{bookingId}</strong>
            </p>
          )}
        </div>
      );
    }
    if (status === "pending") {
      return (
        <div className="text-yellow-600">
          <h2 className="text-2xl font-bold mb-2">Payment Pending ⏳</h2>
          <p>{message}</p>
          {bookingId && (
            <p className="mt-2">
              Booking ID: <strong>{bookingId}</strong>
            </p>
          )}
        </div>
      );
    }
    if (status === "failed") {
      return (
        <div className="text-red-600">
          <h2 className="text-2xl font-bold mb-2">Payment Failed ❌</h2>
          <p>{message}</p>
        </div>
      );
    }
    if (status === "error") {
      return (
        <div className="text-orange-600">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{message}</p>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        {renderContent()}
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 mb-6 px-4 py-2 bg-blue-600  rounded-lg hover:bg-blue-700"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
