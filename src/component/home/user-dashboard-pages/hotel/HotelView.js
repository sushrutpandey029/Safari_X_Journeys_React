import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getUserHotelBookingDetails,
  cancelHotelBooking,
  getHotelCancelStatus,
} from "../../../services/hotelService";
import { confirmBookingCancellation } from "../../../services/commonService";
import { useNavigate } from "react-router-dom";

export default function HotelView({ booking }) {
  const {
    bookingId,
    status,
    totalAmount,
    currency,
    vendorResponse,
    HotelRoomsDetails,
    bookingPayments,
  } = booking;
  const navigate = useNavigate();

  const [bookingDetailData, setBookingDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelState, setCancelState] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelResult, setCancelResult] = useState(null);

  const paymentInfo = bookingPayments?.[0] || {};

  // ================= Fetch Booking Details Live ==================
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const vr = vendorResponse?.BookResult;
        if (!vr) return;

        let payload = { EndUserIp: "192.168.1.11" };

        if (vr?.BookingId) payload.BookingId = vr.BookingId;
        else if (vr?.TraceId) payload.TraceId = vr.TraceId;
        else return;

        const resp = await getUserHotelBookingDetails(payload);
        setBookingDetailData(resp?.data?.GetBookingDetailResult);
      } catch (err) {
        console.error("Hotel detail fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  // ================= Invoice PDF ==================
  const handleDownloadInvoice = () => {
    if (!bookingDetailData) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("HOTEL BOOKING INVOICE", 14, 20);

    doc.setFontSize(12);
    doc.text(`Booking ID: ${bookingId}`, 14, 28);
    doc.text(`Hotel: ${bookingDetailData?.HotelName}`, 14, 34);
    doc.text(`City: ${bookingDetailData?.City}`, 14, 40);
    doc.text(`Check-In: ${bookingDetailData?.CheckInDate}`, 14, 46);
    doc.text(`Check-Out: ${bookingDetailData?.CheckOutDate}`, 14, 52);

    autoTable(doc, {
      startY: 60,
      head: [["Field", "Value"]],
      body: [
        ["Hotel Name", bookingDetailData?.HotelName],
        ["Address", bookingDetailData?.AddressLine1],
        ["Booking Status", bookingDetailData?.HotelBookingStatus],
        ["Check-in", bookingDetailData?.CheckInDate],
        ["Check-out", bookingDetailData?.CheckOutDate],
        ["Total Fare", `${currency} ${totalAmount}`],
        ["Guests", `${bookingDetailData?.Rooms?.[0]?.AdultCount} Adult(s)`],
      ],
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Guest Name", "Age", "Phone"]],
      body:
        HotelRoomsDetails?.flatMap((room) =>
          room.HotelPassenger?.map((p) => [
            `${p.FirstName} ${p.LastName}`,
            p.Age,
            p.Phoneno,
          ])
        ) || [],
    });

    doc.text(
      "Thank you for choosing our platform!",
      14,
      doc.lastAutoTable.finalY + 20
    );
    doc.save(`Invoice_Hotel_${bookingId}.pdf`);
  };

  // ================= Cancel Booking ==================
  const handleCancelBooking = async () => {
    if (!window.confirm("⚠ Confirm booking cancellation? Charges may apply."))
      return;

    setIsCancelling(true);
    setCancelState("processing");
    setCancelMessage("Submitting cancellation request...");

    try {
      const cancelResp = await cancelHotelBooking({
        bookingId,
        EndUserIp: "192.168.1.11",
        Remarks: "Customer requested cancellation",
      });

      console.log("resp of cancel hotel booking",cancelResp)

      const changeRequestId =
        cancelResp.data?.data?.HotelChangeRequestResult?.ChangeRequestId;

      if (!changeRequestId) {
        setCancelState("failed");
        setCancelMessage("Request failed — vendor did not accept.");
        setIsCancelling(false);
        return;
      }

      setCancelMessage("Tracking cancellation status...");

      const pollInterval = setInterval(async () => {
        const statusResp = await getHotelCancelStatus({
          EndUserIp: "192.168.1.11",
          ChangeRequestId: changeRequestId,
        });

        console.log("status resp in gethotelcancelstatus",statusResp)

        const result = statusResp?.data?.data?.HotelChangeRequestStatusResult;
        console.log("result in HotelChangeRequestStatusResult", result);
        const status = result?.ChangeRequestStatus;
        console.log("status in HotelChangeRequestStatusResult", status);

        if (status === 1 || status === 3) {
          clearInterval(pollInterval);

          const refund = result?.RefundedAmount;
          const charge = result?.CancellationCharge;
          const creditNote = result?.CreditNoteNo;
          console.log("refund details :::", refund, charge, creditNote);

          await confirmBookingCancellation({
            bookingId,
            refundAmount: refund,
            cancellationCharge: charge,
            creditNote,
            vendorResponse: result,
          });

          setCancelState("success");
          setCancelResult({ refund, charge, creditNote });
          setCancelMessage("✔ Booking Cancelled Successfully!");
          setIsCancelling(false);
          //   navigate("/user-dashboard");
        } else if (status === 2) {
          clearInterval(pollInterval);
          setCancelState("rejected");
          setCancelMessage("❌ Cancellation Rejected by Hotel");
          setIsCancelling(false);
        }
      }, 5000);
    } catch (err) {
      setCancelState("failed");
      setCancelMessage("❌ Cancellation failed. Try again later.");
      setIsCancelling(false);
    }
  };

  // ================= Render UI ==================
  if (loading) {
    return (
      <div className="alert alert-info">
        ⏳ Loading latest booking details...
      </div>
    );
  }

  return (
    <>
      {/* Cancellation Status Alerts */}
      {cancelState === "processing" && (
        <div className="alert alert-warning">{cancelMessage}</div>
      )}
      {cancelState === "success" && cancelResult && (
        <div className="alert alert-success">
          <strong>Cancellation Complete!</strong>
          <p>Refund Amount: ₹{cancelResult.refund}</p>
          <p>Cancellation Fee: ₹{cancelResult.charge}</p>
          <p>Credit Note: {cancelResult.creditNote}</p>
        </div>
      )}
      {cancelState === "failed" || cancelState === "rejected" ? (
        <div className="alert alert-danger">{cancelMessage}</div>
      ) : null}

      {/* Booking Display */}
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th>Booking ID</th>
            <td>{bookingId}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>{status}</td>
          </tr>
          <tr>
            <th>Hotel Name</th>
            <td>{bookingDetailData?.HotelName}</td>
          </tr>
          <tr>
            <th>City</th>
            <td>{bookingDetailData?.City}</td>
          </tr>
          <tr>
            <th>Check-In</th>
            <td>{bookingDetailData?.CheckInDate}</td>
          </tr>
          <tr>
            <th>Check-Out</th>
            <td>{bookingDetailData?.CheckOutDate}</td>
          </tr>
          <tr>
            <th>Total Amount</th>
            <td>
              {currency} {totalAmount}
            </td>
          </tr>
          <tr>
            <th>Address</th>
            <td>{bookingDetailData?.AddressLine1}</td>
          </tr>
        </tbody>
      </table>

      {/* Action Buttons */}
      {status === "confirmed" && (
        <>
          <button
            className="btn btn-success mt-3"
            onClick={handleDownloadInvoice}
          >
            Download Invoice
          </button>

          <button
            className="btn btn-danger mt-3 ms-2"
            disabled={isCancelling}
            onClick={handleCancelBooking}
          >
            {isCancelling ? "Cancelling..." : "Cancel Booking"}
          </button>
        </>
      )}
    </>
  );
}
