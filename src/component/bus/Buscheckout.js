import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Bus.css';

const BusCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [passengers, setPassengers] = useState([
    {
      seatNumber: '20L',
      name: '',
      age: '',
      gender: ''
    }
  ]);

  const [contactDetails, setContactDetails] = useState({
    email: '',
    mobile: ''
  });

  const [insurance, setInsurance] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [showGST, setShowGST] = useState(false);

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
      passengers,
      contactDetails,
      insurance,
      selectedOffers,
      totalAmount: 879
    };

    console.log('Booking Data:', bookingData);
    alert('Proceeding to payment...');
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

  return (
    <div className="bus-checkout" style={{marginTop:'100px'}}>
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <h1># IntrCity SmartBus</h1>
          <div className="bus-type">Bharat Benz A/C Seater / Sleeper (2+1)</div>
        </div>

        {/* Journey Details */}
        <div className="journey-section">
          <div className="journey-info">
            <div className="time-info">
              <div className="time">22:30</div>
              <div className="date">11 Nov' 25, Tue</div>
            </div>
            <div className="location-info">
              <div className="city">Delhi</div>
              <div className="location-details">
                <div>Isbt Kashmiri gate - boarding zone</div>
                <div>IntrCity Boarding Zone, Ground Floor, Arrival Block, Platform No.55,56,57,58</div>
                <div>Inside ISBT Bus Stand (Delhi)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Main Content - 50/50 Split with Flex */}
        <div className="main-content">
          
          {/* Left Column - Forms */}
          <div className="left-column">
            {/* Traveler Details */}
            <div className="section">
              <h2 className="section-title">Traveler Details</h2>
              <div className="traveler-table">
                <div className="table-row header">
                  <div className="col-seat"></div>
                  <div className="col-name">Name</div>
                  <div className="col-age">Age*</div>
                  <div className="col-gender">Gender</div>
                </div>
                {passengers.map((passenger, index) => (
                  <div key={index} className="table-row">
                    <div className="col-seat">
                      <span className="seat-badge">Seat {passenger.seatNumber}</span>
                    </div>
                    <div className="col-name">
                      <input
                        type="text"
                        placeholder="Type here"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                        className="text-input"
                      />
                    </div>
                    <div className="col-age">
                      <input
                        type="number"
                        placeholder="eg : 24"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                        className="text-input"
                      />
                    </div>
                    <div className="col-gender">
                      <div className="gender-option">
                        <label className="gender-checkbox">
                          <input
                            type="checkbox"
                            checked={passenger.gender === 'Male'}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.checked ? 'Male' : '')}
                          />
                          <span className="checkmark"></span>
                          Male
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-divider"></div>

            {/* Contact Details */}
            <div className="section">
              <h2 className="section-title">Contact Details</h2>
              <p className="section-subtitle">We'll send your ticket here</p>
              
              <div className="contact-fields">
                <div className="contact-field">
                  <label className="field-label">Email id*</label>
                  <div className="input-with-checkbox">
                    <input
                      type="email"
                      placeholder="Type here"
                      value={contactDetails.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className="text-input full-width"
                    />
                  </div>
                </div>
                
                <div className="contact-field">
                  <label className="field-label">Mobile Number*</label>
                  <div className="input-with-checkbox">
                    <input
                      type="tel"
                      placeholder="Type here"
                      value={contactDetails.mobile}
                      onChange={(e) => handleContactChange('mobile', e.target.value)}
                      className="text-input full-width"
                    />
                  </div>
                </div>
                
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showGST}
                      onChange={(e) => setShowGST(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Enter GST details (optional)
                  </label>
                </div>
              </div>
            </div>

            <div className="section-divider"></div>

            {/* Insurance */}
            <div className="section">
              <div className="insurance-section">
                <div className="insurance-header">
                  <label className="insurance-checkbox">
                    <input
                      type="checkbox"
                      checked={insurance}
                      onChange={(e) => setInsurance(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <strong>Secure your trip at just ₹15</strong>
                  </label>
                  <div className="insurance-provider">
                    <div>Powered by</div>
                    <div className="terms-link">Terms and Conditions</div>
                  </div>
                </div>
                
                {insurance && (
                  <div className="insurance-grid">
                    <div className="insurance-item">[Logo of Passage]</div>
                    <div className="insurance-item">[Accidental Death]</div>
                    <div className="insurance-item">[Hospitalisation]</div>
                    <div className="insurance-item">[Actualization]</div>
                    <div className="insurance-item">[Local Response]</div>
                    <div className="insurance-item">[Accidental Death]</div>
                    <div className="insurance-item">[Hospitalisation]</div>
                    <div className="insurance-item">[Accessibility]</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="vertical-divider"></div>

          {/* Right Column - Offers & Price */}
          <div className="right-column">
            {/* Offers */}
            <div className="section">
              <h2 className="section-title">Offers</h2>
              <div className="offers-list">
                {offers.map((offer, index) => (
                  <div key={index} className="offer-item">
                    <label className="offer-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedOffers.includes(offer.code)}
                        onChange={() => handleOfferToggle(offer.code)}
                      />
                      <span className="checkmark"></span>
                      <div className="offer-content">
                        <strong>{offer.code}</strong>
                        <span>{offer.description}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-divider"></div>

            {/* Price Details */}
            <div className="section price-section">
              <h2 className="section-title">Price details</h2>
              <div className="price-table">
                <div className="price-row">
                  <span className="price-label">Base Fare</span>
                  <span className="price-value">₹879.0</span>
                </div>
                <div className="price-row">
                  <span className="price-label">Amount</span>
                  <span className="price-value">₹879.0</span>
                </div>
              </div>
              <div className="price-note">
                Final payable amount will be updated on the next page.
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button - Full Width */}
        <div className="continue-section">
          <button className="continue-btn" onClick={handleContinue}>
            CONTINUE
          </button>
          <p className="agreement">
            By proceeding, I agree to <a href="#agreement">MakeMyTrips User Agreement</a>, 
            <a href="#terms"> Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusCheckout; 