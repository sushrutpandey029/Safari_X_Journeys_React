import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Bus.css';
import { fetchBoardingPoints } from '../services/busservice';

const BusCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [busDetails, setBusDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [droppingPoints, setDroppingPoints] = useState([]);
  const [selectedBoarding, setSelectedBoarding] = useState(null);
  const [selectedDropping, setSelectedDropping] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [contactDetails, setContactDetails] = useState({
    email: '',
    mobile: ''
  });
  const [insurance, setInsurance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format time function
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '--:--';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return '--:--';
    }
  };

  // Format full date
  const formatFullDate = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Calculate duration
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end - start;
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch {
      return 'N/A';
    }
  };

  // ✅ FIXED: Fetch boarding points from API
  // ✅ DEBUG: API parameters check karo
const fetchBoardingPointsData = async (busData) => {
  try {
    setApiLoading(true);
    setError(null);
    console.log("🔄 Fetching boarding points for checkout...");

    // ✅ PARAMETER EXTRACTION - All possible sources
    const TokenId = 
      busData?.TokenId || 
      busData?.tokenId ||
      localStorage.getItem("Bus_Search_Token");

    const TraceId = 
      busData?.TraceId || 
      busData?.traceId || 
      localStorage.getItem("Bus_Trace_Id");

    const ResultIndex = 
      busData?.ResultIndex ?? 
      busData?.resultIndex ?? 
      parseInt(localStorage.getItem("Bus_Result_Index"));

    // 🚨 DEBUG: Detailed parameter check
    console.log("🔍 DEBUG - All Parameter Sources:", {
      fromBusData: {
        TokenId: busData?.TokenId || busData?.tokenId,
        TraceId: busData?.TraceId || busData?.traceId, 
        ResultIndex: busData?.ResultIndex ?? busData?.resultIndex
      },
      fromLocalStorage: {
        TokenId: localStorage.getItem("Bus_Search_Token"),
        TraceId: localStorage.getItem("Bus_Trace_Id"),
        ResultIndex: localStorage.getItem("Bus_Result_Index")
      },
      finalValues: {
        TokenId: TokenId ? `${TokenId.substring(0, 15)}...` : "MISSING",
        TraceId: TraceId ? `${TraceId.substring(0, 15)}...` : "MISSING", 
        ResultIndex: ResultIndex
      }
    });

    // ✅ VALIDATE PARAMETERS - Strict check
    if (!TokenId) {
      const errorMsg = "TokenId is missing";
      console.error("❌", errorMsg);
      setError(errorMsg);
      await loadFallbackPoints();
      return;
    }

    if (!TraceId) {
      const errorMsg = "TraceId is missing";
      console.error("❌", errorMsg);
      setError(errorMsg);
      await loadFallbackPoints();
      return;
    }

    if (ResultIndex === undefined || ResultIndex === null || isNaN(ResultIndex)) {
      const errorMsg = `ResultIndex is invalid: ${ResultIndex}`;
      console.error("❌", errorMsg);
      setError(errorMsg);
      await loadFallbackPoints();
      return;
    }

    console.log("✅ All parameters validated, making API call...");

    // ✅ API CALL
    try {
      const response = await fetchBoardingPoints(TokenId, TraceId, ResultIndex);
      console.log("📥 Boarding Points API Response:", response);

      if (!response) {
        throw new Error("No response from API");
      }

      // ✅ RESPONSE PARSING
      let boardingData = [];
      let droppingData = [];

      // Check multiple response formats
      if (response?.data?.BoardingPointsDetails) {
        boardingData = response.data.BoardingPointsDetails;
      } else if (response?.BoardingPointsDetails) {
        boardingData = response.BoardingPointsDetails;
      } else if (response?.boardingPoints) {
        boardingData = response.boardingPoints;
      } else if (Array.isArray(response?.data)) {
        boardingData = response.data;
      } else if (Array.isArray(response)) {
        boardingData = response;
      } else {
        console.warn("⚠ Unexpected API response format:", response);
      }

      if (response?.data?.DroppingPointsDetails) {
        droppingData = response.data.DroppingPointsDetails;
      } else if (response?.DroppingPointsDetails) {
        droppingData = response.DroppingPointsDetails;
      } else if (response?.droppingPoints) {
        droppingData = response.droppingPoints;
      }

      console.log(`✅ API Success - Boarding: ${boardingData.length}, Dropping: ${droppingData.length}`);

      if (boardingData.length === 0 && droppingData.length === 0) {
        setError("No boarding/dropping points available in API response");
        await loadFallbackPoints();
        return;
      }

      // ✅ SET STATE
      setBoardingPoints(boardingData);
      setDroppingPoints(droppingData);

      // ✅ AUTO-SELECT FIRST POINTS
      if (boardingData.length > 0) {
        setSelectedBoarding(boardingData[0]);
        console.log("✅ Auto-selected boarding point:", boardingData[0]);
      }
      if (droppingData.length > 0) {
        setSelectedDropping(droppingData[0]);
        console.log("✅ Auto-selected dropping point:", droppingData[0]);
      }

      // ✅ UPDATE LOCALSTORAGE
      localStorage.setItem("boardingPoints", JSON.stringify(boardingData));
      localStorage.setItem("droppingPoints", JSON.stringify(droppingData));

    } catch (apiError) {
      console.error("❌ API Call Error:", apiError);
      throw apiError;
    }

  } catch (error) {
    console.error("❌ Boarding points API error:", error);
    setError(`API Error: ${error.message}`);
    await loadFallbackPoints();
  } finally {
    setApiLoading(false);
  }
};
  // ✅ FALLBACK DATA LOADING
  const loadFallbackPoints = async () => {
    try {
      const storedBoarding = localStorage.getItem("boardingPoints");
      const storedDropping = localStorage.getItem("droppingPoints");
      
      let fallbackUsed = false;

      if (storedBoarding) {
        const boardingData = JSON.parse(storedBoarding);
        setBoardingPoints(boardingData);
        if (boardingData.length > 0 && !selectedBoarding) {
          setSelectedBoarding(boardingData[0]);
        }
        fallbackUsed = true;
      }
      
      if (storedDropping) {
        const droppingData = JSON.parse(storedDropping);
        setDroppingPoints(droppingData);
        if (droppingData.length > 0 && !selectedDropping) {
          setSelectedDropping(droppingData[0]);
        }
        fallbackUsed = true;
      }
      
      if (fallbackUsed) {
        console.log("⚠ Using fallback boarding points data from localStorage");
      }
    } catch (fallbackError) {
      console.error("❌ Fallback data error:", fallbackError);
    }
  };

  // ✅ DATA INITIALIZATION
  // ✅ DATA INITIALIZATION - With more debugging
useEffect(() => {
  const initializeData = async () => {
    try {
      setLoading(true);
      console.log("📍 ========== CHECKOUT INITIALIZATION START ==========");

      // 🚨 DEBUG: Check all localStorage items
      console.log("📦 DEBUG - localStorage contents:", {
        selectedBus: localStorage.getItem('selectedBus'),
        selectedSeats: localStorage.getItem('selectedSeats'),
        Bus_Search_Token: localStorage.getItem("Bus_Search_Token"),
        Bus_Trace_Id: localStorage.getItem("Bus_Trace_Id"), 
        Bus_Result_Index: localStorage.getItem("Bus_Result_Index"),
        boardingPoints: localStorage.getItem("boardingPoints"),
        droppingPoints: localStorage.getItem("droppingPoints")
      });

      let busData = null;
      let seatsData = [];

      // ✅ DATA SOURCES
      if (location.state?.bus) {
        console.log("✅ Using data from location state");
        busData = location.state.bus;
        seatsData = location.state.seats || [];
        
        // 🚨 DEBUG: Location state details
        console.log("🔍 Location State Bus Data:", {
          hasTokenId: !!busData?.TokenId,
          hasTraceId: !!busData?.TraceId,
          hasResultIndex: busData?.ResultIndex != null,
          busKeys: Object.keys(busData || {})
        });
      } else {
        console.log("📦 Loading from localStorage");
        const storedBus = localStorage.getItem('selectedBus');
        const storedSeats = localStorage.getItem('selectedSeats');
        
        busData = storedBus ? JSON.parse(storedBus) : null;
        seatsData = storedSeats ? JSON.parse(storedSeats) : [];
        
        // 🚨 DEBUG: localStorage bus data details
        if (busData) {
          console.log("🔍 localStorage Bus Data:", {
            hasTokenId: !!busData?.TokenId,
            hasTraceId: !!busData?.TraceId,
            hasResultIndex: busData?.ResultIndex != null,
            busKeys: Object.keys(busData)
          });
        }
      }

      console.log("🚌 Final Bus Data:", busData);
      console.log("💺 Selected Seats:", seatsData);

      if (!busData) {
        const errorMsg = "No bus data found in location state or localStorage";
        console.error("❌", errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      setBusDetails(busData);
      setSelectedSeats(seatsData);

      // ✅ FETCH BOARDING POINTS
      console.log("📍 Calling fetchBoardingPointsData...");
      await fetchBoardingPointsData(busData);

      console.log("📍 ========== CHECKOUT INITIALIZATION COMPLETE ==========");

    } catch (error) {
      console.error("❌ Checkout initialization error:", error);
      setError(`Initialization failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  initializeData();
}, [location]);

  // ✅ Update passengers when seats change
  useEffect(() => {
    if (selectedSeats.length > 0 && busDetails) {
      const updatedPassengers = selectedSeats.map((seat, index) => ({
        id: index + 1,
        seatNumber: seat.number || seat.seatNumber || `Seat ${index + 1}`,
        name: '',
        age: '',
        gender: 'Male',
        price: seat.price || seat.fare || busDetails.Fare || busDetails.price || 0
      }));
      setPassengers(updatedPassengers);
    }
  }, [selectedSeats, busDetails]);

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleContactChange = (field, value) => {
    setContactDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBoardingChange = (point) => {
    setSelectedBoarding(point);
  };

  const handleDroppingChange = (point) => {
    setSelectedDropping(point);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    const basePrice = passengers.reduce((total, passenger) => total + (passenger.price || 0), 0);
    const insurancePrice = insurance ? 15 : 0;
    return basePrice + insurancePrice;
  };

  const handleContinue = () => {  
    if (!contactDetails.email || !contactDetails.mobile) {
      alert('Please fill in all required contact details');
      return;
    }

    if (passengers.some(p => !p.name || !p.age || !p.gender)) {
      alert('Please fill in all passenger details');
      return;
    }

    if (!selectedBoarding || !selectedDropping) {
      alert('Please select boarding and dropping points');
      return;
    }

    const bookingData = {
      busDetails,
      passengers,
      contactDetails,
      boardingPoint: selectedBoarding,
      droppingPoint: selectedDropping,
      insurance,
      totalAmount: calculateTotalPrice(),
      selectedSeats
    };

    console.log('✅ Final Booking Data:', bookingData);
    
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    navigate('/payment', { state: bookingData });
  };

  // Get bus name from API data
  const getBusName = () => {
    return busDetails?.Travels || busDetails?.BusName || busDetails?.busName || busDetails?.travelName || 'Bus';
  };

  // Get bus type from API data
  const getBusType = () => {
    return busDetails?.BusType || busDetails?.busType || 'AC Sleeper';
  };

  // Get route info from API data
  const getRouteInfo = () => {
    const origin = busDetails?.Origin || busDetails?.origin || busDetails?.from;
    const destination = busDetails?.Destination || busDetails?.destination || busDetails?.to;
    return `${origin || 'Origin'} → ${destination || 'Destination'}`;
  };

  if (loading) {
    return (
      <div className="bus-checkout" style={{marginTop:'100px'}}>
        <div className="checkout-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !busDetails) {
    return (
      <div className="bus-checkout" style={{marginTop:'100px'}}>
        <div className="checkout-container">
          <div className="error-message">
            <h2>Error Loading Data</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/buses')} className="back-btn">
              Go Back to Bus List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bus-checkout" style={{marginTop:'100px'}}>
      <div className="checkout-container">
        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span>⚠ {error}</span>
          </div>
        )}

        {/* Header */}
        <div className="checkout-header">
          <div className="header-content">
            <h1>{getBusName()}</h1>
            <div className="bus-meta">
              <span className="bus-type">{getBusType()}</span>
              <span className="route-info">
                {getRouteInfo()}
              </span>
            </div>
            <div className="journey-date">
              {selectedBoarding ? formatFullDate(selectedBoarding.CityPointTime) : formatFullDate(busDetails.travelDate)} 
              <span className="duration">• {calculateDuration(selectedBoarding?.CityPointTime, selectedDropping?.CityPointTime)}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="checkout-content">
          {/* Left Column - Forms */}
          <div className="left-column">
            {/* Boarding Point Selection */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <i className="icon-pickup"></i>
                  Select Boarding Point
                </h2>
                {apiLoading && <div className="loading-badge">Loading points...</div>}
              </div>
              
              <div className="points-list">
                {boardingPoints.length > 0 ? (
                  boardingPoints.map((point, index) => (
                    <div key={point.CityPointIndex || index} className={`point-item ${selectedBoarding?.CityPointIndex === point.CityPointIndex ? 'selected' : ''}`}>
                      <label className="point-radio">
                        <input
                          type="radio"
                          name="boarding"
                          checked={selectedBoarding?.CityPointIndex === point.CityPointIndex}
                          onChange={() => handleBoardingChange(point)}
                        />
                        <span className="radiomark"></span>
                        <div className="point-content">
                          <div className="point-time-badge">
                            {formatTime(point.CityPointTime)}
                          </div>
                          <div className="point-details">
                            <h4 className="point-name">{point.CityPointName || 'Boarding Point'}</h4>
                            <p className="point-location">{point.CityPointLocation || ''}</p>
                            {point.CityPointAddress && (
                              <p className="point-address">{point.CityPointAddress}</p>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))
                ) : !apiLoading ? (
                  <div className="no-points">
                    <p>No boarding points available</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Dropping Point Selection */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <i className="icon-drop"></i>
                  Select Dropping Point
                </h2>
                {apiLoading && <div className="loading-badge">Loading points...</div>}
              </div>
              <div className="points-list">
                {droppingPoints.length > 0 ? (
                  droppingPoints.map((point, index) => (
                    <div key={point.CityPointIndex || index} className={`point-item ${selectedDropping?.CityPointIndex === point.CityPointIndex ? 'selected' : ''}`}>
                      <label className="point-radio">
                        <input
                          type="radio"
                          name="dropping"
                          checked={selectedDropping?.CityPointIndex === point.CityPointIndex}
                          onChange={() => handleDroppingChange(point)}
                        />
                        <span className="radiomark"></span>
                        <div className="point-content">
                          <div className="point-time-badge">
                            {formatTime(point.CityPointTime)}
                          </div>
                          <div className="point-details">
                            <h4 className="point-name">{point.CityPointName || 'Dropping Point'}</h4>
                            <p className="point-location">{point.CityPointLocation || ''}</p>
                            {point.CityPointAddress && (
                              <p className="point-address">{point.CityPointAddress}</p>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))
                ) : !apiLoading ? (
                  <div className="no-points">
                    <p>No dropping points available</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Passenger Details */}
            <div className="section-card">
              <h2 className="section-title">Passenger Details</h2>
              <div className="passengers-list">
                {passengers.map((passenger, index) => (
                  <div key={index} className="passenger-card">
                    <h4>Passenger {index + 1} - {passenger.seatNumber}</h4>
                    <div className="passenger-form">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          placeholder="Enter full name"
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Age *</label>
                          <input
                            type="number"
                            placeholder="Age"
                            min="1"
                            max="100"
                            value={passenger.age}
                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Gender *</label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            required
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="section-card">
              <h2 className="section-title">Contact Details</h2>
              <div className="contact-form">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={contactDetails.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={contactDetails.mobile}
                    onChange={(e) => handleContactChange('mobile', e.target.value)}
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="right-column">
            {/* Journey Summary */}
            <div className="summary-card">
              <h3>Journey Summary</h3>
              <div className="journey-timeline">
                <div className="timeline-point start">
                  <div className="time">{formatTime(selectedBoarding?.CityPointTime)}</div>
                  <div className="location">
                    <strong>{selectedBoarding?.CityPointName || 'Boarding Point'}</strong>
                    <span>{selectedBoarding?.CityPointLocation || ''}</span>
                  </div>
                </div>
                <div className="timeline-connector">
                  <div className="duration">
                    {calculateDuration(selectedBoarding?.CityPointTime, selectedDropping?.CityPointTime)}
                  </div>
                  <div className="connector-line"></div>
                </div>
                <div className="timeline-point end">
                  <div className="time">{formatTime(selectedDropping?.CityPointTime)}</div>
                  <div className="location">
                    <strong>{selectedDropping?.CityPointName || 'Dropping Point'}</strong>
                    <span>{selectedDropping?.CityPointLocation || ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fare Summary */}
            <div className="summary-card">
              <h3>Fare Summary</h3>
              <div className="fare-breakdown">
                <div className="fare-item">
                  <span>Base Fare ({passengers.length} {passengers.length === 1 ? 'passenger' : 'passengers'})</span>
                  <span>₹{passengers.reduce((total, p) => total + (p.price || 0), 0)}</span>
                </div>
                <div className="fare-item">
                  <span>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={insurance}
                        onChange={(e) => setInsurance(e.target.checked)}
                      />
                      Travel Insurance (₹15)
                    </label>
                  </span>
                  <span>{insurance ? '₹15' : '₹0'}</span>
                </div>
                <div className="fare-total">
                  <span>Total Amount</span>
                  <span className="total-price">₹{calculateTotalPrice()}</span>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button 
              className="continue-btn" 
              onClick={handleContinue}
              disabled={apiLoading || !selectedBoarding || !selectedDropping}
            >
              {apiLoading ? 'Loading...' : 'Continue to Payment'}
            </button>

            {(!selectedBoarding || !selectedDropping) && (
              <p className="warning-text">Please select boarding and dropping points</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusCheckout;