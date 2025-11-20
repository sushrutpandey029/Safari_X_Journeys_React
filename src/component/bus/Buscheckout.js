import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Bus.css';

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
      month: 'short'
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

  // Initialize data from location state or localStorage
  useEffect(() => {
    const initializeData = () => {
      try {
        setLoading(true);

        // Data location state se lo (direct navigation)
        const locationState = location.state;
        
        if (locationState) {
          console.log("📍 Location State Data:", locationState);
          setBusDetails(locationState.bus);
          setSelectedSeats(locationState.seats || []);
          setBoardingPoints(locationState.boardingPoints || []);
          setDroppingPoints(locationState.droppingPoints || []);
        } else {
          // Fallback: localStorage se data lo
          console.log("📦 Loading from localStorage");
          const savedBus = JSON.parse(localStorage.getItem('selectedBus') || 'null');
          const savedSeats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
          const savedBoarding = JSON.parse(localStorage.getItem('boardingPoints') || '[]');
          const savedDropping = JSON.parse(localStorage.getItem('droppingPoints') || '[]');
          
          setBusDetails(savedBus);
          setSelectedSeats(savedSeats);
          setBoardingPoints(savedBoarding);
          setDroppingPoints(savedDropping);
        }

        // Set default selections
        if (boardingPoints.length > 0) {
          setSelectedBoarding(boardingPoints[0]);
        }
        if (droppingPoints.length > 0) {
          setSelectedDropping(droppingPoints[0]);
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
    if (selectedSeats.length > 0) {
      const updatedPassengers = selectedSeats.map((seat, index) => ({
        seatNumber: seat.number || `Seat ${index + 1}`,
        name: '',
        age: '',
        gender: '',
        price: seat.price || busDetails?.price || 500
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

  const handleOfferToggle = (offerCode) => {
    setSelectedOffers(prev =>
      prev.includes(offerCode)
        ? prev.filter(code => code !== offerCode)
        : [...prev, offerCode]
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
    return passengers.reduce((total, passenger) => total + (passenger.price || 0), 0);
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

    const bookingData = {
      busDetails,
      passengers,
      contactDetails,
      boardingPoint: selectedBoarding,
      droppingPoint: selectedDropping,
      insurance,
      selectedOffers,
      totalAmount: calculateTotalPrice() + (insurance ? 15 : 0),
      selectedSeats
    };

    console.log('✅ Booking Data:', bookingData);
    
    // Save to localStorage for payment page
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Navigate to payment page
    navigate('/payment', { state: bookingData });
  };

  const offers = [
    { code: 'MEGABUS', description: 'Get discount up to 10% on your bus booking!' },
    { code: 'MMTEXTRA', description: 'Get Rs 15 instant discount on your bus booking. Additionally, get up to 25% off on your hotel booking.' },
    { code: 'MMTBOBVISA', description: 'Flat 8% off for Bank of Baroda Debit Cards only.' },
    { code: 'IDBICC', description: 'Exclusive Offer - Get Flat 10% off (upto INR 500) on IDBI CC Users' },
    { code: 'IDBIDC', description: 'Exclusive Offer - Get Flat 10% off (upto INR 500) on IDBI DC Users' },
    { code: 'MMTHSBCFEST', description: 'Exclusive HSBC Debit & Credit Cards Offer -Get up to 10% off' },
    { code: 'BUSTRAINPASS', description: 'Travel Pass - Buy for Rs. 99 and get Instant Rs. 50 off and 4 vouchers each worth Rs. 50 off on bus, Rs. 25 off on train bookings of Min. ATV Rs. 500.' }
  ];

  if (loading) {
    return (
      <div className="bus-checkout" style={{marginTop:'100px'}}>
        <div className="checkout-container">
          <div className="loading-spinner">Loading booking details...</div>
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
          <h1># {busDetails.busName}</h1>
          <div className="bus-type">{busDetails.busType}</div>
          <div className="route-info">
            {busDetails.from} → {busDetails.to}
          </div>
          <div className="journey-date">
            {selectedBoarding ? formatFullDate(selectedBoarding.CityPointTime) : '--'} • {calculateDuration(selectedBoarding?.CityPointTime, selectedDropping?.CityPointTime)}
          </div>
        </div>

        {/* Boarding Point Selection */}
        <div className="section">
          <h2 className="section-title">Select Boarding Point</h2>
          <div className="points-list">
            {boardingPoints.map((point, index) => (
              <div key={index} className="point-item">
                <label className="point-radio">
                  <input
                    type="radio"
                    name="boarding"
                    checked={selectedBoarding?.CityPointIndex === point.CityPointIndex}
                    onChange={() => handleBoardingChange(point)}
                  />
                  <span className="radiomark"></span>
                  <div className="point-details">
                    <div className="point-time">{formatTime(point.CityPointTime)}</div>
                    <div className="point-location">
                      <strong>{point.CityPointName}</strong>
                      <div>{point.CityPointLocation}</div>
                      {point.CityPointAddress && <div>{point.CityPointAddress}</div>}
                      {point.CityPointLandmark && <div>Landmark: {point.CityPointLandmark}</div>}
                      {point.CityPointContactNumber && <div>Contact: {point.CityPointContactNumber}</div>}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Dropping Point Selection */}
        <div className="section">
          <h2 className="section-title">Select Dropping Point</h2>
          <div className="points-list">
            {droppingPoints.map((point, index) => (
              <div key={index} className="point-item">
                <label className="point-radio">
                  <input
                    type="radio"
                    name="dropping"
                    checked={selectedDropping?.CityPointIndex === point.CityPointIndex}
                    onChange={() => handleDroppingChange(point)}
                  />
                  <span className="radiomark"></span>
                  <div className="point-details">
                    <div className="point-time">{formatTime(point.CityPointTime)}</div>
                    <div className="point-location">
                      <strong>{point.CityPointName}</strong>
                      <div>{point.CityPointLocation}</div>
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Journey Summary */}
        <div className="journey-summary">
          <div className="journey-section">
            <div className="journey-info">
              {/* Boarding Time */}
              <div className="time-info">
                <div className="time">{formatTime(selectedBoarding?.CityPointTime)}</div>
                <div className="date">{formatDate(selectedBoarding?.CityPointTime)}</div>
              </div>

              {/* Boarding Location */}
              <div className="location-info">
                <div className="city">{busDetails.from}</div>
                <div className="location-details">
                  <div><strong>{selectedBoarding?.CityPointName}</strong> - boarding zone</div>
                  <div>{selectedBoarding?.CityPointLocation}</div>
                  {selectedBoarding?.CityPointAddress && <div>{selectedBoarding?.CityPointAddress}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="journey-connector">
            <div className="duration">
              {calculateDuration(selectedBoarding?.CityPointTime, selectedDropping?.CityPointTime)}
            </div>
            <div className="connector-line"></div>
          </div>

          <div className="journey-section">
            <div className="journey-info">
              {/* Dropping Time */}
              <div className="time-info">
                <div className="time">{formatTime(selectedDropping?.CityPointTime)}</div>
                <div className="date">{formatDate(selectedDropping?.CityPointTime)}</div>
              </div>

              {/* Dropping Location */}
              <div className="location-info">
                <div className="city">{busDetails.to}</div>
                <div className="location-details">
                  <div><strong>{selectedDropping?.CityPointName}</strong></div>
                  <div>{selectedDropping?.CityPointLocation}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of your existing code for forms, offers, price etc. */}
        {/* ... (same as before for forms section) ... */}

      </div>
    </div>
  );
};

export default BusCheckout;