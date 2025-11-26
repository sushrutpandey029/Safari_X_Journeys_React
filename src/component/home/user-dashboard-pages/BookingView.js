import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getUserHotelBookingDetails,
  cancelHotelBooking,
  getHotelCancelStatus,
} from "../../services/hotelService";

function BookingView() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.bookingData;
  const {
    bookingId,
    serviceType,
    status,
    totalAmount,
    currency,
    serviceDetails,
    payments,
    vendorResponse,
    HotelRoomsDetails,
  } = booking;

  console.log("booking in bookingview", booking);
  const [cancelLoading, setCancelLoading] = useState(false);

  const getBookingDetails = async () => {
    const bookingId = vendorResponse?.BookResult?.BookingId;
    const confirmationNo = vendorResponse?.BookResult?.ConfirmationNo;
    const traceId = vendorResponse?.BookResult?.TraceId;
    const guestName = vendorResponse?.BookResult?.GuestName; // if available

    let payload = {
      EndUserIp: "192.168.1.11", // or client's IP
    };

    if (bookingId) {
      payload.BookingId = bookingId;
    } else if (confirmationNo && guestName) {
      const splitName = guestName.split(" ");
      payload.ConfirmationNo = confirmationNo;
      payload.FirstName = splitName[0];
      payload.LastName = splitName.slice(1).join(" ");
    } else if (traceId) {
      payload.TraceId = traceId;
    } else {
      console.error(
        "❌ No valid identifier available to fetch booking details."
      );
      return; // Stop API call because nothing valid to send
    }

    try {
      const resp = await getUserHotelBookingDetails(payload);
      console.log("Booking details response:", resp);
    } catch (err) {
      console.log("❌ Error fetching booking details:", err);
    }
  };

  useEffect(() => {
    getBookingDetails();
  }, []);

  if (!booking) {
    return (
      <div className="container mt-5 text-center">
        <h5>No booking data found</h5>
        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  // ---------------- PDF Generator ----------------
  const handleDownloadInvoice = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text(`${serviceType.toUpperCase()} Booking Invoice`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Booking ID: ${bookingId}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37);

    // ---------------- HOTEL INVOICE ----------------
    if (serviceType === "hotel") {
      autoTable(doc, {
        startY: 45,
        head: [["Field", "Value"]],
        body: [
          ["Hotel Name", serviceDetails?.hotelName || "N/A"],
          ["Hotel Address", serviceDetails?.hotelAddress || "N/A"],
          ["Check-In", serviceDetails?.checkIn || "N/A"],
          ["Check-Out", serviceDetails?.checkOut || "N/A"],
          ["Total Amount", `${currency} ${totalAmount}`],
          ["Payment Method", payments?.[0]?.paymentMethod || "N/A"],
          ["Payment Status", payments?.[0]?.paymentStatus || "N/A"],
        ],
      });

      // Guest Details Table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [
          [
            "Title",
            "First Name",
            "Middle Name",
            "Last Name",
            "Email",
            "Phone",
            "Age",
          ],
        ],
        body:
          HotelRoomsDetails?.flatMap((room) =>
            room.HotelPassenger?.map((pax) => [
              pax.Title,
              pax.FirstName,
              pax.MiddleName || "-",
              pax.LastName,
              pax.Email || "-",
              pax.Phoneno || "-",
              pax.Age || "-",
            ])
          ) || [],
      });

      // Vendor Info
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Vendor Info", "Value"]],
        body: [
          ["TBO Booking ID", vendorResponse?.BookResult?.BookingId || "N/A"],
          ["Booking Ref No", vendorResponse?.BookResult?.BookingRefNo || "N/A"],
          [
            "Confirmation No",
            vendorResponse?.BookResult?.ConfirmationNo || "N/A",
          ],
          [
            "Hotel Booking Status",
            vendorResponse?.BookResult?.HotelBookingStatus || "N/A",
          ],
          ["Trace ID", vendorResponse?.BookResult?.TraceId || "N/A"],
        ],
      });
    }

    // ---------------- GUIDE INVOICE ----------------
    else if (serviceType === "guide") {
      autoTable(doc, {
        startY: 45,
        head: [["Field", "Value"]],
        body: [
          ["Guide Name", serviceDetails?.guideName || "N/A"],
          ["Email", serviceDetails?.guideEmail || "N/A"],
          ["Phone", serviceDetails?.guidePhone || "N/A"],
          ["Selected Date", serviceDetails?.selectedDate || "N/A"],
          ["Location", serviceDetails?.location || "N/A"],
          [
            "Available Days",
            Array.isArray(serviceDetails?.availableDays)
              ? serviceDetails.availableDays.join(", ")
              : "N/A",
          ],
          [
            "Charges Per Day",
            `${currency} ${serviceDetails?.chargesPerDay || 0}`,
          ],
          ["Payment Method", payments?.[0]?.paymentMethod || "N/A"],
          ["Payment Status", payments?.[0]?.paymentStatus || "N/A"],
        ],
      });

      // Vendor Info (if available)
      if (vendorResponse) {
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 10,
          head: [["Vendor Info", "Value"]],
          body: [
            ["Booking Reference", vendorResponse?.bookingRef || "N/A"],
            ["Confirmation Code", vendorResponse?.confirmationCode || "N/A"],
            ["Guide Status", vendorResponse?.status || "N/A"],
          ],
        });
      }
    }

    // Footer
    doc.text(
      "Thank you for booking with Safarix!",
      14,
      doc.lastAutoTable.finalY + 20
    );

    // Save PDF
    doc.save(`Invoice_${serviceType}_${bookingId}.pdf`);
  };

  // ---------------- Cancel Booking ----------------

  const handleCancelBooking = async () => {
    // 🛑 Ask confirmation first
    const confirmCancel = window.confirm(
      "⚠️ Are you sure you want to cancel this booking?\n\nThis action cannot be undone."
    );

    if (!confirmCancel) return; // ❌ User cancelled the action

    setCancelLoading(true);

    if (!vendorResponse?.BookResult?.BookingId) {
      setCancelLoading(false);
      return alert("❌ Booking ID is missing — cannot cancel.");
    }

    const payload = {
      BookingId: vendorResponse.BookResult.BookingId,
      Remarks: "Customer requested cancellation", // 🔥 static reason
    };

    try {
      // 1️⃣ Call Cancel API
      const cancelResp = await cancelHotelBooking(payload);
      console.log("Cancel response:", cancelResp.data);

      if (!cancelResp.data?.data?.ChangeRequestId) {
        return alert("❌ Cancellation failed — No Change Request ID returned");
      }

      const changeRequestId = cancelResp.data.data.ChangeRequestId;

      alert(`⏳ Cancellation request sent. Checking status...`);

      // 2️⃣ Polling Cancel Status Every 5 Seconds
      const checkStatus = async () => {
        const statusResp = await getHotelCancelStatus({
          EndUserIp: "192.168.1.11",
          ChangeRequestId: changeRequestId,
        });

        console.log("Status response:", statusResp.data);

        const status = statusResp.data?.data?.ChangeRequestStatus;

        if (!status) return;

        if (status === 1) {
          alert("✔ Booking cancellation confirmed.");
          window.location.reload();
        } else if (status === 2) {
          alert("❌ Cancellation failed or rejected.");
        } else {
          // pending → retry
          setTimeout(checkStatus, 5000);
        }
      };

      checkStatus();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to process cancellation.");
    } finally {
      setCancelLoading(false);
    }
  };

  // ---------------- UI Renderer ----------------
  const renderBookingDetails = () => {
    switch (serviceType) {
      case "hotel":
        return (
          <>
            <tr>
              <th>Hotel Name</th>
              <td>{serviceDetails?.hotelName || "N/A"}</td>
            </tr>
            <tr>
              <th>Hotel Address</th>
              <td>{serviceDetails?.hotelAddress || "N/A"}</td>
            </tr>
            <tr>
              <th>Check-In</th>
              <td>{serviceDetails?.checkIn || "N/A"}</td>
            </tr>
            <tr>
              <th>Check-Out</th>
              <td>{serviceDetails?.checkOut || "N/A"}</td>
            </tr>

            {/* 🔹 Guest Details */}
            <tr className="table-primary">
              <th colSpan={2}>Guest Details</th>
            </tr>
            {HotelRoomsDetails?.map((room, roomIndex) =>
              room.HotelPassenger?.map((pax, paxIndex) => (
                <tr key={`${roomIndex}-${paxIndex}`}>
                  <td colSpan={2}>
                    {pax.Title} {pax.FirstName} {pax.MiddleName || ""}{" "}
                    {pax.LastName} | Email: {pax.Email || "N/A"} | Phone:{" "}
                    {pax.Phoneno || "N/A"} | Age: {pax.Age || "N/A"}
                  </td>
                </tr>
              ))
            )}
          </>
        );

      case "guide":
        return (
          <>
            <tr>
              <th>Guide Name</th>
              <td>{serviceDetails?.guideName || "N/A"}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{serviceDetails?.guideEmail || "N/A"}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{serviceDetails?.guidePhone || "N/A"}</td>
            </tr>
            <tr>
              <th>Selected Date</th>
              <td>{serviceDetails?.selectedDate || "N/A"}</td>
            </tr>
            <tr>
              <th>Available Days</th>
              <td>
                {Array.isArray(serviceDetails?.availableDays)
                  ? serviceDetails.availableDays.join(", ")
                  : "N/A"}
              </td>
            </tr>
            <tr>
              <th>Location</th>
              <td>{serviceDetails?.location || "N/A"}</td>
            </tr>
            <tr>
              <th>Charges Per Day</th>
              <td>
                {currency} {serviceDetails?.chargesPerDay || "N/A"}
              </td>
            </tr>
          </>
        );

      default:
        return (
          <tr>
            <td colSpan={2}>Unknown service type</td>
          </tr>
        );
    }
  };

  return (
    <div className="container" style={{ marginTop: "130px" }}>
      <h4 className="mb-3 text-capitalize">{serviceType} Booking Details</h4>

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
            <th>Total Amount</th>
            <td>
              {currency} {totalAmount}
            </td>
          </tr>

          {renderBookingDetails()}

          <tr>
            <th>Payment Method</th>
            <td>{payments?.[0]?.paymentMethod || "N/A"}</td>
          </tr>
          <tr>
            <th>Payment Status</th>
            <td>{payments?.[0]?.paymentStatus || "N/A"}</td>
          </tr>
        </tbody>
      </table>

      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
        Back to Bookings
      </button>

      {status === "confirmed" ? (
        <>
          <button
            className="btn btn-success mt-3 ms-3"
            onClick={handleDownloadInvoice}
          >
            Download Invoice (PDF)
          </button>
          <button
            className="btn btn-danger mt-3 ms-3"
            onClick={handleCancelBooking}
          >
            Cancel Booking
          </button>
        </>
      ) : (
        <p className="text-danger mt-3">
          Invoice not available — booking status: {status}
        </p>
      )}
    </div>
  );
}

export default BookingView;
