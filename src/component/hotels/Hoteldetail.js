import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom"; // ✅ useNavigate added
import { getHotelDetail, searchHotels } from "../services/hotelService";
import "./HotelBooking.css";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Fancybox } from "@fancyapps/ui";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { getUserData } from "../utils/storage";

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
  const navigate = useNavigate(); // ✅ hook called inside component

  const { hotelCode } = useParams();
  const [hotel, setHotel] = useState(null);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { startPayment } = useCashfreePayment();
  const priceTableRef = useRef(null);

  const bookingData = location.state || {};

  console.log("booking data from previous page", bookingData);

  const scrollToPriceTable = () => {
    if (priceTableRef.current) {
      priceTableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

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

  // ✅ Book hotel and navigate to checkout
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
        hotelRating: hotelDetails?.StarRating,
        hotelAddress: hotelDetails?.Address || "",

        checkIn: bookingData?.checkIn,
        checkOut: bookingData?.checkOut,

        GuestNationality: bookingData?.guestNationality,
        NoOfRooms: bookingData?.NoOfRooms,

        // ✅ PRICE DETAILS (FROM API)
        TotalFare: Number(room?.TotalFare || 0),
        TotalTax: Number(room?.TotalTax || 0),
        NetAmount: Number(room?.NetAmount || 0),
        PriceBreakUp: room?.PriceBreakUp || [],
        Pricing : room?.Pricing,
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

      // ✅ KEEP PRICE ALSO AT ROOT LEVEL (FOR CHECKOUT PAGE)
      totalAmount: Number(room?.TotalFare || 0),
      totalTax: Number(room?.TotalTax || 0),
      netAmount: Number(room?.NetAmount || 0),

      currency: "INR",
    };

    navigate("/hotel-checkout", {
      state: {
        payload,
        selectedRoom: room,
        hotelInfo: hotelDetails,
        searchFilters: bookingData,
      },
    });
  }

  // Fetch hotel details + search results
  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        // ✅ Details
        const detailResp = await getHotelDetail(hotelCode);
        console.log("gethotel details resp", detailResp);

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
            rating: details.HotelRating, // ⬅️ fix (API me HotelRating hai)
            price: roomData?.[0]?.TotalFare || "N/A", // optional chaining safe
            currency: searchHotel?.Currency || "INR", // optional chaining safe
            images: details.Images || [],
            facilities: details.HotelFacilities || [], // ⬅️ add amenities
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
    <div>
      <div className="hotel-detail-page">
           

        <div className="container">

                 <div className="col-sm-12 border-bottom mb-4 pb-3">
  <nav aria-label="breadcrumb ">
    <ol className="breadcrumb mb-0">
      <li className="breadcrumb-item">
        <a href="/">Home</a>
      </li>

      <li className="breadcrumb-item">
        <a href="/hotel-list">Hotels</a>
      </li>

      <li className="breadcrumb-item active" aria-current="page">
        Hotel Detail
      </li>
    </ol>
  </nav>
</div>
            <div className="row">

                        
              {/* Left - Images */}
              <div className="col-md-6">
                <a
                  href={hotel.images[0]}
                  data-fancybox="gallery"
                  data-caption={hotel.name}
                >
                  <img
                    src={hotel.images[0]}
                    alt="Hotel"
                    className="hotel-main-img rounded img-fluid"
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
              <div className="col-md-6">
                <div className="right-details">
                  {/* Title & Rating */}
                  <h3 className="fw-bold">{hotel.location}</h3>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h4 className="fw-bold mb-0">{hotel.name}</h4>
                    <span className="badge bg-primary">⭐ {hotel.rating}</span>
                  </div>

                  {/* ✅ Hotel Rating, CheckIn & CheckOut */}

                  <div className="mb-2 small">
                    <span className="fw-bold">Address:</span> {hotel.Address}
                  </div>

                  {/* ✅ Description with ReadMore */}
                  <div className="p-tag">
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
                  <div className="d-flex flex-wrap gap-2 small aminities">
                    {hotel?.facilities?.slice(0, 6).map((f, i) => (
                      <span key={i} className="badge bg-light text-dark border">
                        {f}
                      </span>
                    ))}
                    {hotel?.facilities?.length > 6 && (
                      <span className="badge bg-light text-primary">
                        + More
                      </span>
                    )}
                  </div>

                  <div className="d-flex align-items-center mt-3">
                    <a
                      href={`https://maps.google.com/?q=${hotel.location}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ms-auto small text-primary"
                    >
                      See on Map
                    </a>
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <button
                      className="explore-btn"
                      onClick={scrollToPriceTable}
                    >
                      Choose room
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Room Pricing Table */}
      <div className="room-detail">
        <div className="container">
          <div
            ref={priceTableRef}
            className="room-pricing-table card shadow-sm border-0 mb-4"
          >
            {/* Card Header */}
            <div className="card-header bg-gradient text-white py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-door-open me-2"></i> Room Options & Pricing
              </h5>
            </div>

            {/* Card Body */}
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Room Type</th>
                      <th>Inclusions</th>
                      {/* <th>Base Price</th> */}
                      <th>Total Fare</th>
                      {/* <th>Tax</th> */}
                      <th>Meal Type</th>
                      <th>Cancellation</th>
                      <th>Action</th>
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
                              <div className="fw-semibold text-dark">
                                {roomName}
                              </div>
                              <div className="small text-muted">
                                {/* {room.BookingCode && `Code: ${room.BookingCode}`} */}
                              </div>
                            </td>

                            <td>
                              {room.Inclusion ? (
                                <div className="d-flex flex-wrap gap-1">
                                  {room?.Inclusion?.split(",").map(
                                    (item, i) => (
                                      <span
                                        key={i}
                                        className="badge bg-light text-dark border"
                                      >
                                        {item.trim()}
                                      </span>
                                    )
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted small">
                                  No inclusions
                                </span>
                              )}
                            </td>

                            {/* <td className="text-success fw-semibold">
                              ₹{basePrice}
                            </td> */}

                            <td className="text-primary fw-semibold">
                              ₹{Math.ceil(room.DisplayPrice) || "N/A"}
                            </td>

                            {/* <td className="text-muted">
                              ₹{room.TotalTax || "N/A"}
                            </td> */}

                            <td>
                              <span className="badge bg-info text-dark">
                                {room.MealType || "N/A"}
                              </span>
                            </td>

                            <td>
                              {room?.CancelPolicies ? (
                                <div className="small">
                                  {room?.CancelPolicies?.map((policy, i) => (
                                    <div
                                      key={i}
                                      className="badge bg-light text-dark border me-1 mb-1"
                                    >
                                      {policy.FromDate}:{" "}
                                      {policy.ChargeType === "Percentage"
                                        ? `${policy.CancellationCharge}%`
                                        : `₹${policy.CancellationCharge}`}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span
                                  className={`badge ${
                                    isRefundable === "Yes"
                                      ? "bg-success"
                                      : "bg-danger"
                                  }`}
                                >
                                  {isRefundable}
                                </span>
                              )}
                            </td>

                            <td>
                              <button
                                onClick={() => handleBook(room)}
                                className="btn btn-sm book-btn"
                              >
                                Book
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">
                          No room information available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
