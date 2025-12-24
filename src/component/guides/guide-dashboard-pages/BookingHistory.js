import React, { useEffect, useState } from "react";
import { guideBookingHistory } from "../../services/guideService";
import { getUserData } from "../../utils/storage";

function BookingHistory() {
  const [activeTab, setActiveTab] = useState("present");
  const [data, setData] = useState({
    pastBookings: [],
    presentBookings: [],
    futureBookings: [],
    counts: {},
    today: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const guide = getUserData("guide");
      const res = await guideBookingHistory(guide.guideId);
      setData(res.data);
    } catch (err) {
      console.log("error in booking history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getActiveBookings = () => {
    if (activeTab === "past") return data.pastBookings;
    if (activeTab === "present") return data.presentBookings;
    return data.futureBookings;
  };

  if (loading) return <div>Loading booking history...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <p>Today: {data.today}</p>

      {/* 🔘 Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <TabButton
          label={`Past (${data.counts.past})`}
          active={activeTab === "past"}
          onClick={() => setActiveTab("past")}
        />
        <TabButton
          label={`Current (${data.counts.present})`}
          active={activeTab === "present"}
          onClick={() => setActiveTab("present")}
        />
        <TabButton
          label={`Upcoming (${data.counts.future})`}
          active={activeTab === "future"}
          onClick={() => setActiveTab("future")}
        />
      </div>

      {/* 📦 Booking List */}
      {getActiveBookings().length === 0 ? (
        <div>No bookings found.</div>
      ) : (
        getActiveBookings().map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))
      )}
    </div>
  );
}

/* 🔘 Tab Button */
const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 16px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      cursor: "pointer",
      backgroundColor: active ? "#0d6efd" : "#f8f9fa",
      color: active ? "#fff" : "#000",
    }}
  >
    {label}
  </button>
);

/* 📄 Booking Card */
const BookingCard = ({ booking }) => {
  const user = booking.safarix_user;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "12px",
      }}
    >
      <h6>Booking ID: {booking.bookingId}</h6>

      <p>
        <strong>Dates:</strong>{" "}
        {new Date(booking.startDate).toLocaleDateString()} →{" "}
        {new Date(booking.endDate).toLocaleDateString()}
      </p>

      <p>
        <strong>Amount:</strong> ₹{booking.totalAmount} ({booking.currency})
      </p>

      <p>
        <strong>Status:</strong>{" "}
        <span
          style={{ color: booking.status === "confirmed" ? "green" : "orange" }}
        >
          {booking.status}
        </span>
      </p>

      <hr />

      <p>
        <strong>User:</strong> {user?.fullName}
      </p>
      <p>
        <strong>Email:</strong> {user?.emailid}
      </p>
      <p>
        <strong>Phone:</strong> {user?.phonenumber}
      </p>
    </div>
  );
};

export default BookingHistory;
