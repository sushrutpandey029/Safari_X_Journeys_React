import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getHotelDetail, searchHotels } from "../services/hotelService";
import "./HotelBooking.css";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Fancybox } from "@fancyapps/ui";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { getUserData } from "../utils/storage";

// ─── Room UI Helpers ──────────────────────────────────────────────────────────

const mealIcon = {
  Room_Only: "🛏️",
  BreakFast: "☕",
  Half_Board: "🍽️",
  Full_Board: "🍱",
  Dinner: "🌙",
};

const mealLabel = {
  Room_Only: "Room Only",
  BreakFast: "Breakfast",
  Half_Board: "Half Board",
  Full_Board: "Full Board",
  Dinner: "Dinner",
};

const mealColor = {
  Room_Only:  { bg: "#FFF3E0", text: "#E65100",  border: "#FFB74D" },
  BreakFast:  { bg: "#E8F5E9", text: "#2E7D32",  border: "#81C784" },
  Half_Board: { bg: "#E3F2FD", text: "#1565C0",  border: "#64B5F6" },
  Full_Board: { bg: "#F3E5F5", text: "#6A1B9A",  border: "#CE93D8" },
  Dinner:     { bg: "#FCE4EC", text: "#880E4F",  border: "#F48FB1" },
};

function groupRoomsByName(rooms) {
  const map = {};
  rooms.forEach((room) => {
    const key = room.Name?.[0] || "Room";
    if (!map[key]) map[key] = [];
    map[key].push(room);
  });
  Object.keys(map).forEach((k) => {
    map[k].sort((a, b) => (a.DisplayPrice || 0) - (b.DisplayPrice || 0));
  });
  return map;
}

function CancelBadge({ policies }) {
  if (!policies || policies.length === 0)
    return <span style={{ color: "#999", fontSize: 12 }}>—</span>;

  const nonZero = policies.find((p) => p.CancellationCharge > 0);
  if (!nonZero)
    return (
      <span style={{
        background: "#E8F5E9", color: "#2E7D32", border: "1px solid #81C784",
        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      }}>
        ✅ Free Cancel
      </span>
    );

  const isPercent = nonZero.ChargeType === "Percentage";
  return (
    <span style={{
      background: "#FFF3E0", color: "#BF360C", border: "1px solid #FFAB40",
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    }}>
      ⚠️ {isPercent ? `${nonZero.CancellationCharge}% charge` : `₹${nonZero.CancellationCharge}`}
    </span>
  );
}

function InclusionChips({ inclusion }) {
  if (!inclusion)
    return <span style={{ color: "#bbb", fontSize: 12 }}>—</span>;
  const items = inclusion.split(",").map((s) => s.trim()).filter(Boolean);
  const show = items.slice(0, 3);
  const rest = items.length - 3;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {show.map((item, i) => (
        <span key={i} style={{
          background: "#F0F4FF", color: "#3B4A80", border: "1px solid #C5CEF5",
          padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 500,
        }}>
          {item}
        </span>
      ))}
      {rest > 0 && (
        <span style={{
          background: "#EEE", color: "#555",
          padding: "2px 8px", borderRadius: 12, fontSize: 11,
        }}>
          +{rest} more
        </span>
      )}
    </div>
  );
}

// ✅ UPDATED: defaultOpen prop added
function RoomGroup({ name, variants, onBook, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen); // ✅ pehla room open, baaki close
  const lowestPrice = variants[0]?.DisplayPrice || 0;

  return (
    <div style={{
      marginBottom: 16, borderRadius: 12, overflow: "hidden",
      border: "1px solid #E0E7FF", boxShadow: "0 2px 8px rgba(60,80,200,0.07)",
      background: "#fff",
    }}>
      {/* ── Room Header ── */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          background: "linear-gradient(90deg, #3D52A0 0%, #5A6FCC 100%)",
          cursor: "pointer", userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🏨</span>
          <div>
            <div style={{
              color: "#fff", fontWeight: 700, fontSize: 15,
              letterSpacing: 0.2, fontFamily: "'Segoe UI', sans-serif",
            }}>
              {name}
            </div>
            <div style={{ color: "#B0BCFF", fontSize: 12, marginTop: 2 }}>
              {variants.length} option{variants.length > 1 ? "s" : ""} available
              &nbsp;·&nbsp; from{" "}
              <span style={{ color: "#FFD700", fontWeight: 700 }}>
                ₹{Math.ceil(lowestPrice).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
        {/* ✅ UPDATED: "View Plans" → "View Options" */}
        <span style={{
          background: "rgba(255,255,255,0.15)", color: "#fff",
          padding: "4px 12px", borderRadius: 20, fontSize: 12,
          border: "1px solid rgba(255,255,255,0.3)",
        }}>
          {open ? "▲ Hide" : "▼ View Options"}
        </span>
      </div>

      {/* ── Variants Table ── */}
      {open && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F5F7FF", borderBottom: "1px solid #E0E7FF" }}>
              {["Meal Plan", "Inclusions", "Cancellation", "Price", ""].map((h, i) => (
                <th key={i} style={{
                  padding: "10px 16px",
                  textAlign: i === 3 || i === 4 ? "right" : "left",
                  fontSize: 12, fontWeight: 600, color: "#5A6FCC",
                  letterSpacing: 0.5, textTransform: "uppercase",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variants.map((room, idx) => {
              const meal = room.MealType || "Room_Only";
              const mc = mealColor[meal] || mealColor.Room_Only;
              const isLast = idx === variants.length - 1;

              return (
                <tr
                  key={idx}
                  style={{ borderBottom: isLast ? "none" : "1px solid #F0F3FF", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F8F9FF")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Meal Plan */}
                  <td style={{ padding: "14px 16px", minWidth: 140 }}>
                    <span style={{
                      background: mc.bg, color: mc.text, border: `1px solid ${mc.border}`,
                      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      display: "inline-flex", alignItems: "center", gap: 5,
                    }}>
                      {mealIcon[meal] || "🛏️"} {mealLabel[meal] || meal}
                    </span>
                  </td>

                  {/* Inclusions */}
                  <td style={{ padding: "14px 16px" }}>
                    <InclusionChips inclusion={room.Inclusion} />
                  </td>

                  {/* Cancellation */}
                  <td style={{ padding: "14px 16px" }}>
                    <CancelBadge policies={room.CancelPolicies} />
                  </td>

                  {/* Price */}
                  <td style={{ padding: "14px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{
                      color: "#1E6F42", fontWeight: 800, fontSize: 17,
                      fontFamily: "'Segoe UI', sans-serif",
                    }}>
                      ₹{Math.ceil(room.DisplayPrice).toLocaleString("en-IN")}
                    </div>
                    <div style={{ color: "#999", fontSize: 11 }}>incl. taxes</div>
                  </td>

                  {/* Book Button */}
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <button
                      onClick={() => onBook(room)}
                      style={{
                        background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                        color: "#fff", border: "none", borderRadius: 8,
                        padding: "9px 22px", fontWeight: 700, fontSize: 13,
                        cursor: "pointer", boxShadow: "0 3px 10px rgba(255,107,53,0.35)",
                        transition: "transform 0.1s, box-shadow 0.1s", letterSpacing: 0.3,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 5px 15px rgba(255,107,53,0.45)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 3px 10px rgba(255,107,53,0.35)";
                      }}
                    >
                      Book Now
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const getValue = (obj, keys, defaultValue = "") => {
  for (let key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return defaultValue;
};

const HotelDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelCode } = useParams();

  const [hotel, setHotel] = useState(null);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { startPayment } = useCashfreePayment();
  const priceTableRef = useRef(null);

  const bookingData = location.state || {};

  // Group rooms by name (MMT style)
  const groupedRooms = useMemo(() => groupRoomsByName(rooms), [rooms]);

  const scrollToPriceTable = () => {
    priceTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function getUserIP() {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip;
    } catch {
      return "";
    }
  }

  async function handleBook(room) {
    const userdetails = await getUserData("safarix_user");
    const ip = await getUserIP();

    const payload = {
      userId: userdetails?.id,
      serviceType: "hotel",
      vendorType: "hotel",
      vendorId: hotelDetails?.HotelCode,
      serviceDetails: {
        hotelCode: hotelDetails?.HotelCode,
        hotelName: hotelDetails?.HotelName,
        hotelRating: hotelDetails?.HotelRating,
        hotelAddress: hotelDetails?.Address || "",
        checkIn: bookingData?.checkIn,
        checkOut: bookingData?.checkOut,
        GuestNationality: bookingData?.guestNationality,
        NoOfRooms: bookingData?.NoOfRooms,
        TotalFare: Number(room?.TotalFare || 0),
        TotalTax: Number(room?.TotalTax || 0),
        NetAmount: Number(room?.NetAmount || 0),
        PriceBreakUp: room?.PriceBreakUp || [],
        Pricing: room?.Pricing,
        BookingCode: room?.BookingCode,
        RoomType: room?.RoomTypeName,
        RoomCategory: room?.RoomCategory || "",
        RoomMealPlan: room?.MealType || "",
        RoomOccupancy: room?.Occupancy || "",
        currency: "INR",
        enduserip: ip,
        PaxRooms: bookingData?.PaxRooms,
        ResponseTime: bookingData?.ResponseTime,
        IsDetailedResponse: bookingData?.IsDetailedResponse,
        Filters: bookingData?.Filters,
      },
      startDate: bookingData?.checkIn,
      endDate: bookingData?.checkOut,
      totalAmount: Number(room?.TotalFare || 0),
      totalTax: Number(room?.TotalTax || 0),
      netAmount: Number(room?.NetAmount || 0),
      currency: "INR",
    };

    navigate("/hotel-checkout", {
      state: { payload, selectedRoom: room, hotelInfo: hotelDetails, searchFilters: bookingData },
    });
  }

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const detailResp = await getHotelDetail(hotelCode);
        const details = detailResp?.data?.HotelDetails?.[0] || null;
        setHotelDetails(details);

        const searchResp = await searchHotels({
          CheckIn: bookingData.checkIn,
          CheckOut: bookingData.checkOut,
          HotelCodes: hotelCode.toString(),
          GuestNationality: bookingData.GuestNationality || bookingData.guestNationality || "IN",
          NoOfRooms: bookingData.NoOfRooms || 1,
          PaxRooms: bookingData.PaxRooms,
          ResponseTime: bookingData.ResponseTime || 30,
          IsDetailedResponse: true,
          Filters: { Refundable: false, MealType: "All" },
        });

        const hotelResults =
          searchResp?.data?.data?.HotelResult ||
          searchResp?.data?.HotelResult ||
          searchResp?.HotelResult ||
          [];

        const searchHotel =
          hotelResults.find((h) => h.HotelCode?.toString() === hotelCode?.toString()) || {};

        const roomData = searchHotel?.Rooms || [];
        setRooms(roomData);

        if (details) {
          setHotel({
            code: details.HotelCode,
            name: details.HotelName,
            description: details.Description,
            location: details.CityName,
            Address: details.Address,
            rating: details.HotelRating,
            price: roomData?.[0]?.TotalFare || "N/A",
            currency: searchHotel?.Currency || "INR",
            images: details.Images || [],
            facilities: details.HotelFacilities || [],
            country: details.CountryName,
            pin: details.PinCode,
            map: details.Map,
          });
        }
      } catch (err) {
        console.error("❌ Error fetching hotel data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (hotelCode) fetchHotelData();
  }, [hotelCode]);

  const stripHtml = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  useEffect(() => {
    if (hotel?.images) Fancybox.bind("[data-fancybox]", {});
    return () => Fancybox.destroy();
  }, [hotel]);

  const toggleReadMore = () => setExpanded(!expanded);

  if (loading)
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (!hotel)
    return (
      <div className="container my-4">
        <p className="text-center">No hotel details found.</p>
      </div>
    );

  const words = hotel.description.split(" ");
  const shouldTruncate = words?.length > 50;
  const shortDesc = words.slice(0, 50).join(" ") + "...";

  return (
    <div className="hotel-detail-page">
      <div>
        <div className="container">
          <div className="row">
            {/* Left - Images */}
            <div className="col-md-6">
              <a href={hotel.images[0]} data-fancybox="gallery" data-caption={hotel.name}>
                <img src={hotel.images[0]} alt="Hotel" className="hotel-main-img rounded img-fluid" />
              </a>
              <div className="hotel-sub-imgs d-flex gap-2 flex-wrap mt-2">
                {hotel?.images?.slice(1, 4).map((img, i) => (
                  <div key={i} className="hotel-sub-img-wrapper" style={{ width: "30%", position: "relative" }}>
                    <a href={img} data-fancybox="gallery" data-caption={`${hotel.name} - Image ${i + 2}`}>
                      <img src={img} alt={`Hotel-${i}`} className="hotel-sub-img rounded img-fluid"
                        style={{ width: "100%", height: "100px", objectFit: "cover" }} />
                    </a>
                    {i === 2 && hotel?.images?.length > 4 && (
                      <div className="hotel-overlay" style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.5)", color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px",
                      }}>
                        +{hotel?.images?.length - 4} More
                      </div>
                    )}
                  </div>
                ))}
                {hotel?.images?.slice(4).map((img, j) => (
                  <a key={j} href={img} data-fancybox="gallery"
                    data-caption={`${hotel.name} - Extra Image`} style={{ display: "none" }}>
                    <img src={img} alt={`Hidden-${j}`} />
                  </a>
                ))}
              </div>
            </div>

            {/* Right - Details */}
            <div className="col-md-6">
              <div className="right-details">
                <h3 className="fw-bold">{hotel.location}</h3>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h4 className="fw-bold mb-0">{hotel.name}</h4>
                  <span className="badge bg-primary">⭐ {hotel.rating}</span>
                </div>
                <div className="mb-2 small">
                  <span className="fw-bold">Address:</span> {hotel.Address}
                </div>
                <div className="p-tag">
                  {shouldTruncate && !expanded ? stripHtml(shortDesc) : stripHtml(hotel.description)}
                </div>
                {shouldTruncate && (
                  <button onClick={toggleReadMore} className="btn btn-link p-0 small">
                    {expanded ? "Read Less" : "Read More"}
                  </button>
                )}
                <h6 className="fw-bold mt-3">Amenities</h6>
                <div className="d-flex flex-wrap gap-2 small aminities">
                  {hotel?.facilities?.slice(0, 6).map((f, i) => (
                    <span key={i} className="badge bg-light text-dark border">{f}</span>
                  ))}
                  {hotel?.facilities?.length > 6 && (
                    <span className="badge bg-light text-primary">+ More</span>
                  )}
                </div>
                <div className="d-flex align-items-center mt-3">
                  <a href={`https://maps.google.com/?q=${hotel.location}`} target="_blank"
                    rel="noreferrer" className="ms-auto small text-primary">
                    See on Map
                  </a>
                </div>
                <div className="d-flex align-items-center mt-3">
                  <button className="explore-btn" onClick={scrollToPriceTable}>Choose room</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MMT-Style Grouped Room Listing ── */}
      <div className="room-detail">
        <div className="container" ref={priceTableRef}>

          {/* Section Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginBottom: 20, borderBottom: "2px solid #E0E7FF", paddingBottom: 12,
            marginTop: 24,
          }}>
            <span style={{ fontSize: 22 }}>🛎️</span>
            <h5 style={{
              margin: 0, color: "#3D52A0", fontWeight: 800,
              fontSize: 20, letterSpacing: 0.3,
            }}>
              Room Options & Pricing
            </h5>
            <span style={{
              marginLeft: "auto", background: "#EEF2FF", color: "#5A6FCC",
              padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: "1px solid #C5CEF5",
            }}>
              {Object.keys(groupedRooms).length} Room Type{Object.keys(groupedRooms).length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ✅ UPDATED: index === 0 wale ko defaultOpen={true} milega */}
          {rooms.length > 0 ? (
            Object.entries(groupedRooms).map(([name, variants], index) => (
              <RoomGroup
                key={name}
                name={name}
                variants={variants}
                onBook={handleBook}
                defaultOpen={index === 0}
              />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#aaa", fontSize: 15 }}>
              No rooms available.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HotelDetail;