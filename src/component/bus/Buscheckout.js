import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Bus.css';
import { fetchBoardingPoints } from '../services/busservice';

const BusCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State for all data
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
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [showGST, setShowGST] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);

  // Format time function
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '--:--';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Format date function
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '--';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format full date
  const formatFullDate = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate duration
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Fetch boarding points from API
  const fetchBoardingPointsData = async (busData) => {
    try {
      setApiLoading(true);
      console.log("🚀 Fetching boarding points for bus:", busData);

      const TokenId = busData?.TokenId;
      const TraceId = busData?.TraceId;
      const ResultIndex = busData?.ResultIndex;

      // 🛑 STOP API if details missing
      if (!TokenId || !TraceId || ResultIndex === undefined) {
        console.error("❌ Missing required params", { TokenId, TraceId, ResultIndex });
        return;
      }

      // 🔥 Correct API Call
      const response = await fetchBoardingPoints({
        TokenId,
        TraceId,
        ResultIndex
      });

      console.log("📥 Boarding API Response:", response);

      if (response && response.data) {
        const boardingData = response.data.BoardingPointsDetails || [];
        const droppingData = response.data.DroppingPointsDetails || [];
        
        console.log("📍 Boarding Points:", boardingData);
        console.log("📍 Dropping Points:", droppingData);

        setBoardingPoints(boardingData);
        setDroppingPoints(droppingData);

        // Set default selections
        if (boardingData.length > 0) {
          setSelectedBoarding(boardingData[0]);
        }
        if (droppingData.length > 0) {
          setSelectedDropping(droppingData[0]);
        }
      } else {
        console.error("❌ Invalid API response structure");
      }

    } catch (error) {
      console.error("❌ Error fetching boarding points:", error);
      // Fallback to mock data if API fails
      const mockBoardingPoints = [
        {
          CityPointAddress: "Domlur Main Road",
          CityPointContactNumber: "0099988899",
          CityPointIndex: 1,
          CityPointLandmark: "Near Domlur Flyover",
          CityPointLocation: "Domlur I Stage",
          CityPointName: "Domlur I Stage (Pickup Bus)",
          CityPointTime: new Date().toISOString()
        }
      ];
      
      const mockDroppingPoints = [
        {
          CityPointIndex: 1,
          CityPointLocation: "Anand Bagh",
          CityPointName: "Anand Bagh",
          CityPointTime: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString()
        }
      ];

      setBoardingPoints(mockBoardingPoints);
      setDroppingPoints(mockDroppingPoints);
      setSelectedBoarding(mockBoardingPoints[0]);
      setSelectedDropping(mockDroppingPoints[0]);
    } finally {
      setApiLoading(false);
    }
  };

  // Initialize data from location state or localStorage
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // Data location state se lo (direct navigation)
        const locationState = location.state;
        let busData = null;
        let seatsData = [];

        if (locationState) {
          console.log("📍 Location State Data:", locationState);
          busData = locationState.bus;
          seatsData = locationState.seats || [];
        } else {
          // Fallback: localStorage se data lo
          console.log("📦 Loading from localStorage");
          busData = JSON.parse(localStorage.getItem('selectedBus') || 'null');
          seatsData = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
        }

        console.log("🚌 Bus Data:", busData);
        console.log("💺 Selected Seats:", seatsData);

        setBusDetails(busData);
        setSelectedSeats(seatsData);

        // Fetch boarding points from API
        if (busData) {
          await fetchBoardingPointsData(busData);
        }

      } catch (error) {
        console.error("❌ Error initializing checkout data:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [location]);

  // Update passengers when seats change
  useEffect(() => {
    if (selectedSeats.length > 0 && busDetails) {
      const updatedPassengers = selectedSeats.map((seat, index) => ({
        id: index + 1,
        seatNumber: seat.number || seat.seatNumber || `Seat ${index + 1}`,
        name: '',
        age: '',
        gender: 'Male',
        price: seat.price || busDetails.price || 500
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

  const handleOfferToggle = (offer) => {
    setSelectedOffers(prev =>
      prev.includes(offer.code)
        ? prev.filter(code => code !== offer.code)
        : [...prev, offer.code]
    );
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
      selectedOffers,
      totalAmount: calculateTotalPrice(),
      selectedSeats
    };

    console.log('✅ Booking Data:', bookingData);
    
    // Save to localStorage for payment page
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Navigate to payment page
    navigate('/payment', { state: bookingData });
  };

  const offers = [
    { code: 'MEGABUS', description: 'Get discount up to 10% on your bus booking!', discount: '10%' },
    { code: 'MMTEXTRA', description: 'Get Rs 15 instant discount on your bus booking.', discount: '₹15' },
    { code: 'MMTBOBVISA', description: 'Flat 8% off for Bank of Baroda Debit Cards only.', discount: '8%' },
    { code: 'IDBICC', description: 'Exclusive Offer - Get Flat 10% off (upto INR 500) on IDBI CC Users', discount: '10%' },
  ];

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

  if (!busDetails) {
    return (
      <div className="bus-checkout" style={{marginTop:'100px'}}>
        <div className="checkout-container">
          <div className="error-message">
            <h2>No Booking Data Found</h2>
            <p>Please go back and select seats first.</p>
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
        {/* Header */}
        <div className="checkout-header">
          <div className="header-content">
            <h1>{busDetails.busName}</h1>
            <div className="bus-meta">
              <span className="bus-type">{busDetails.busType}</span>
              <span className="route-info">
                {busDetails.from} → {busDetails.to}
              </span>
            </div>
            <div className="journey-date">
              {selectedBoarding ? formatFullDate(selectedBoarding.CityPointTime) : '--'} 
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
                            <h4 className="point-name">{point.CityPointName}</h4>
                            <p className="point-location">{point.CityPointLocation}</p>
                            {point.CityPointAddress && (
                              <p className="point-address">{point.CityPointAddress}</p>
                            )}
                            {point.CityPointLandmark && (
                              <p className="point-landmark">
                                <span className="landmark-icon">📍</span>
                                {point.CityPointLandmark}
                              </p>
                            )}
                            {point.CityPointContactNumber && (
                              <p className="point-contact">
                                <span className="contact-icon">📞</span>
                                {point.CityPointContactNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="no-points">
                    <p>No boarding points available</p>
                  </div>
                )}
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
                            <h4 className="point-name">{point.CityPointName}</h4>
                            <p className="point-location">{point.CityPointLocation}</p>
                            {point.CityPointAddress && (
                              <p className="point-address">{point.CityPointAddress}</p>
                            )}
                            {point.CityPointLandmark && (
                              <p className="point-landmark">
                                <span className="landmark-icon">📍</span>
                                {point.CityPointLandmark}
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="no-points">
                    <p>No dropping points available</p>
                  </div>
                )}
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
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Age *</label>
                          <input
                            type="number"
                            placeholder="Age"
                            value={passenger.age}
                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Gender *</label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
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
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={contactDetails.mobile}
                    onChange={(e) => handleContactChange('mobile', e.target.value)}
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
                    <strong>{selectedBoarding?.CityPointName}</strong>
                    <span>{selectedBoarding?.CityPointLocation}</span>
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
                    <strong>{selectedDropping?.CityPointName}</strong>
                    <span>{selectedDropping?.CityPointLocation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fare Summary */}
            <div className="summary-card">
              <h3>Fare Summary</h3>
              <div className="fare-breakdown">
                <div className="fare-item">
                  <span>Base Fare ({passengers.length} passengers)</span>
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
            <button className="continue-btn" onClick={handleContinue}>
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusCheckout;