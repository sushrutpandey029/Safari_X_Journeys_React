import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHotelDetail, searchHotels } from "../services/hotelService";
import "./HotelBooking.css";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Fancybox } from "@fancyapps/ui";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { getUserData } from "../utils/storage";
import { useLocation } from "react-router-dom";
import  { useRef } from "react";

const getValue = (obj, keys, defaultValue = "") => {
  for (let key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  return defaultValue;
};

const HotelDetail = () => {
  const location = useLocation();

  const { hotelCode } = useParams();
  const [hotel, setHotel] = useState(null);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false); // ✅ ReadMore toggle states
  const { startPayment } = useCashfreePayment();
  


  const priceTableRef = useRef(null);

  // Scroll handler
  const scrollToPriceTable = () => {
    if (priceTableRef.current) {
      priceTableRef.current.scrollIntoView({
        behavior: "smooth", // smooth scroll
        block: "start"      // top pe align hoga
      });
    }
  };

  const bookingData = location.state || {};
  console.log("booking data from previous page", bookingData);

  async function getUserIP() {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      console.log("ip", data.ip);
      return data.ip;
    } catch (err) {
      console.error("Error fetching IP:", err);
      return "";
    }
  }

  // Book hotel
  async function handleBook(room) {
    const userdetails = await getUserData("safarix_user");
    const ip = await getUserIP();

    const payload = {
      userId: userdetails?.id,
      serviceType: "hotel",
      serviceDetails: {
        hotelCode: hotelDetails.HotelCode,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        GuestNationality: bookingData.guestNationality,
        NoOfRooms: bookingData.NoOfRooms,
        totalAmount: room.TotalFare,
        BookingCode: room.BookingCode, // ✅ fixed
        enduserip: ip,
        currency: "INR",
        PaxRooms: bookingData?.PaxRooms,
        ResponseTime: bookingData.ResponseTime,
        IsDetailedResponse: bookingData.IsDetailedResponse,
        Filters: bookingData.Filters,
      },
      startDate: bookingData.checkIn,
      endDate: bookingData.checkOut,
      totalAmount: room.TotalFare,
      currency: "INR",
    };

    const result = await startPayment(payload);
    console.log("payment res", result);
  }

  // Fetch hotel details + search results
  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        // ✅ Details
        const detailResp = await getHotelDetail(hotelCode);
        console.log(
          "gethotel details resp",
          JSON.stringify(detailResp, null, 2)
        );

        const details = detailResp?.data?.HotelDetails?.[0] || null;
        setHotelDetails(details);

        // ✅ Search using exact bookingData
        const searchResp = await searchHotels({
          CheckIn: bookingData.checkIn,
          CheckOut: bookingData.checkOut,
          HotelCodes: hotelCode.toString(),
          GuestNationality: bookingData.guestNationality || "IN",
          NoOfRooms: bookingData.NoOfRooms || 1,
          PaxRooms: bookingData.PaxRooms,
          ResponseTime: bookingData.ResponseTime || 30,
          IsDetailedResponse: true, // force true for details
          Filters: {
            Refundable: true, // relax filters to match working Postman
            MealType: "WithMeal", // "All" was too restrictive
          },
        });

        console.log("🔍 searchResp:", searchResp);

        const searchHotel =
          searchResp?.HotelResult?.find((h) => h.HotelCode == hotelCode) || {};

        const roomData = searchHotel?.Rooms || [];
        setRooms(roomData);

      // ✅ Use local `details` (not `hotelDetails` which is stale here)
if (details) {
  setHotel({
    code: details.HotelCode,
    name: details.HotelName,
    description: details.Description,
    location: details.CityName,
   Address: details.Address, 
    rating: details.HotelRating,         // ⬅️ fix (API me HotelRating hai)
    price: roomData?.[0]?.TotalFare || "N/A",   // optional chaining safe
    currency: searchHotel?.Currency || "INR",   // optional chaining safe
    images: details.Images || [],
    facilities: details.HotelFacilities || [],  // ⬅️ add amenities
    country: details.CountryName,
    pin: details.PinCode,
    map: details.Map
  });
}

      } catch (err) {
        console.error("❌ Error fetching hotel data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (hotelCode) fetchHotelData();
  }, [hotelCode, bookingData]);

  const stripHtml = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // ✅ Fancybox
  useEffect(() => {
    if (hotel && hotel.images) {
      Fancybox.bind("[data-fancybox]", {});
    }
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

  // ✅ Read More logic
  const words = hotel.description.split(" ");
  const shouldTruncate = words?.length > 50;
  const shortDesc = words.slice(0, 50).join(" ") + "...";


  

  return (
    <div className="container my-4">
      <div className="hotel-card shadow-sm border-0 mb-4 p-3">
        {/* Title & Rating */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h4 className="fw-bold mb-0">{hotel.name}</h4>
          <span className="badge bg-primary">⭐ {hotel.rating}</span>
        </div>

        <div className="row g-3">
          {/* Left - Images */}
          <div className="col-md-7">
            <a
              href={hotel.images[0]}
              data-fancybox="gallery"
              data-caption={hotel.name}
            >
              <img
                src={hotel.images[0]}
                alt="Hotel"
                className="hotel-main-img rounded img-fluid"
                style={{ width: "100%", height: "300px", objectFit: "cover" }}
              />
            </a>

            {/* Sub Images */}
            <div className="hotel-sub-imgs d-flex gap-2 flex-wrap mt-2">
              {hotel?.images?.slice(1, 4).map((img, i) => (
                <div
                  key={i}
                  className="hotel-sub-img-wrapper"
                  style={{ width: "30%", position: "relative" }}
                >
                  <a
                    href={img}
                    data-fancybox="gallery"
                    data-caption={`${hotel.name} - Image ${i + 2}`}
                  >
                    <img
                      src={img}
                      alt={`Hotel-${i}`}
                      className="hotel-sub-img rounded img-fluid"
                      style={{
                        width: "100%",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  </a>

                  {i === 2 && hotel?.images?.length > 4 && (
                    <div
                      className="hotel-overlay"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "4px",
                      }}
                    >
                      +{hotel?.images?.length - 4} More
                    </div>
                  )}
                </div>
              ))}

              {/* Hidden images for Fancybox */}
              {hotel?.images?.slice(4).map((img, j) => (
                <a
                  key={j}
                  href={img}
                  data-fancybox="gallery"
                  data-caption={`${hotel.name} - Extra Image`}
                  style={{ display: "none" }}
                >
                  <img src={img} alt={`Hidden-${j}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Right - Details */}
        <div className="col-md-5">
  <div className="p-2">
    <div className="d-flex justify-content-between align-items-center mb-2">
      

     <button 
        className="btn btn-primary btn-sm" 
        onClick={scrollToPriceTable}
      >
        Choose room
      </button>
    </div>

    {/* ✅ Hotel Rating, CheckIn & CheckOut */}
    <div className="mb-2 small">
      <span className="fw-bold">Address:</span> {hotel.Address}
    </div>

    {/* ✅ Description with ReadMore */}
    <div className="small text-muted">
      {shouldTruncate && !expanded
        ? stripHtml(shortDesc)
        : stripHtml(hotel.description)}
    </div>
    {shouldTruncate && (
      <button
        onClick={toggleReadMore}
        className="btn btn-link p-0 small"
      >
        {expanded ? "Read Less" : "Read More"}
      </button>
    )}

    <h6 className="fw-bold mt-3">Amenities</h6>
    <div className="d-flex flex-wrap gap-2 small">
      {hotel?.facilities?.slice(0, 6).map((f, i) => (
        <span key={i} className="badge bg-light text-dark border">
          {f}
        </span>
      ))}
      {hotel?.facilities?.length > 6 && (
        <span className="badge bg-light text-primary">+ More</span>
      )}
    </div>

    <div className="d-flex align-items-center mt-3">
      <span className="fw-bold">{hotel.location}</span>
      <a
        href={`https://maps.google.com/?q=${hotel.location}`}
        target="_blank"
        rel="noreferrer"
        className="ms-auto small text-primary"
      >
        See on Map
      </a>
    </div>
  </div>
</div>

        </div>
      </div>

      {/* Room Pricing Table */}

     <div
        ref={priceTableRef}
        className="room-pricing-table card shadow-sm border-0 mb-4"
      >
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Room Options & Pricing</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Room Type</th>
                  <th scope="col">Inclusions</th>
                  <th scope="col">Base Price</th>
                  <th scope="col">Total Fare</th>
                  <th scope="col">Tax</th>
                  <th scope="col">Meal Type</th>
                  <th scope="col">Cancellation Policy</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {rooms?.length > 0 ? (
                  rooms?.map((room, index) => {
                    const basePrice =
                      room.DayRates?.[0]?.[0]?.BasePrice || "N/A";
                    const roomName = room.Name?.[0] || "Room";
                    const isRefundable = room.IsRefundable ? "Yes" : "No";

                    return (
                      <tr key={index}>
                        <td>
                          <div className="fw-medium">{roomName}</div>
                          <div className="small text-muted">
                            {room.BookingCode && `Code: ${room.BookingCode}`}
                          </div>
                        </td>
                        <td>
                          {room.Inclusion ? (
                            <div className="small">
                              {room?.Inclusion?.split(",").map((item, i) => (
                                <span
                                  key={i}
                                  className="badge bg-light text-dark me-1 mb-1"
                                >
                                  {item.trim()}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "No inclusions"
                          )}
                        </td>
                        <td className="text-nowrap">
                          <span className="fw-medium text-success">
                            ₹{basePrice}
                          </span>
                        </td>
                        <td className="text-nowrap">
                          <span className="fw-medium text-primary">
                            ₹{room.TotalFare || "N/A"}
                          </span>
                        </td>
                        <td className="text-nowrap">
                          <span className="text-muted">
                            ₹{room.TotalTax || "N/A"}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {room.MealType || "N/A"}
                          </span>
                        </td>
                        <td>
                          <div className="small">
                            {room?.CancelPolicies ? (
                              room?.CancelPolicies?.map((policy, i) => (
                                <div key={i}>
                                  {policy.FromDate}:{" "}
                                  {policy.ChargeType === "Percentage"
                                    ? `${policy.CancellationCharge}%`
                                    : `₹${policy.CancellationCharge}`}
                                </div>
                              ))
                            ) : (
                              <span
                                className={
                                  isRefundable === "Yes"
                                    ? "text-success"
                                    : "text-danger"
                                }
                              >
                                {isRefundable === "Yes"
                                  ? "Refundable"
                                  : "Non-refundable"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleBook(room)}
                            className="btn btn-sm btn-primary"
                          >
                            Book
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No room information available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
         
        </div>
      </div>

      <style>{`
    .hotel-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
    }
    .room-pricing-table {
      border-radius: 12px;
      overflow: hidden;
    }
    .room-pricing-table .table {
      margin-bottom: 0;
    }
    .room-pricing-table .table th {
      border-top: none;
      font-weight: 600;
      vertical-align: middle;
    }
    .room-pricing-table .table td {
      vertical-align: middle;
    }
    .hotel-main-img {
      transition: transform 0.3s ease;
    }
    .hotel-main-img:hover {
      transform: scale(1.02);
    }
    .hotel-sub-img {
      transition: transform 0.3s ease;
    }
    .hotel-sub-img:hover {
      transform: scale(1.05);
    }
    .btn-primary {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      border: none;
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #0056b3 0%, #004494 100%);
      transform: translateY(-1px);
    }
  `}</style>
    </div>
  );
};

export default HotelDetail;
