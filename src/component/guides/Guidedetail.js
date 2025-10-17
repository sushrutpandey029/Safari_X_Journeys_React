import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_URL } from "../services/apiEndpoints";
import './GuideCareers.css';

const Guidedetail = () => {
  const { guideId } = useParams();
  
  console.log("🎯 GUIDEDETAIL PAGE LOADED");
  console.log("📌 Guide ID from URL:", guideId);

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9, 1)); // October 2025

  // Fetch guide details from API
  useEffect(() => {
    const fetchGuideDetails = async () => {
      try {
        setLoading(true);
        
        console.log("📡 Fetching all guides...");
        const response = await fetch(`${BASE_URL}/guides`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch guides');
        }
        
        const allGuidesData = await response.json();
        console.log("✅ All guides data received:", allGuidesData);
        
        let foundGuide = null;
        
        if (allGuidesData.data && Array.isArray(allGuidesData.data)) {
          foundGuide = allGuidesData.data.find(g => 
            g.guideId == guideId || g.id == guideId || g._id == guideId
          );
        } else if (Array.isArray(allGuidesData)) {
          foundGuide = allGuidesData.find(g => 
            g.guideId == guideId || g.id == guideId || g._id == guideId
          );
        }
        
        console.log("🔍 Found guide:", foundGuide);
        
        if (!foundGuide) {
          console.log("🔄 Guide not found in list, trying direct API...");
          try {
            const directResponse = await fetch(`${BASE_URL}/guides/${guideId}`);
            if (directResponse.ok) {
              const directData = await directResponse.json();
              foundGuide = directData;
              console.log("✅ Direct API success:", foundGuide);
            }
          } catch (directError) {
            console.log("❌ Direct API also failed");
          }
        }

        if (!foundGuide) {
          console.log("📝 Using sample data for guide:", guideId);
          foundGuide = getSampleGuideData(guideId);
        }

        const mappedGuide = mapGuideData(foundGuide, guideId);
        console.log("🎯 Final mapped guide:", mappedGuide);
        
        setGuide(mappedGuide);
        
      } catch (err) {
        console.error("❌ Error:", err);
        const sampleGuide = getSampleGuideData(guideId);
        setGuide(mapGuideData(sampleGuide, guideId));
      } finally {
        setLoading(false);
      }
    };

    if (guideId) {
      fetchGuideDetails();
    } else {
      setError("No guide ID provided");
      setLoading(false);
    }
  }, [guideId]);

  // Sample data function
  const getSampleGuideData = (id) => {
    const sampleGuides = {
      "1": {
        fullName: "Rahul Sharma",
        city: "Jajpur",
        state: "Rajasthan",
        workExperience: [{ years: 8 }],
        languageProficiency: [
          { language: "English" },
          { language: "Hindi" },
          { language: "German" }
        ],
        typesOfTours: ["Cultural Tours", "Historical Sites"],
        professionalSummary: "Passionate about Rajasthani culture and heritage. I love sharing the rich history of Jajpur's magnificent forts and palaces with travelers from around the world.",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        profileImage: "rahul-sharma.jpg"
      },
      "2": {
        fullName: "Priya Patel",
        city: "Udaipur",
        state: "Rajasthan", 
        workExperience: [{ years: 5 }],
        languageProficiency: [
          { language: "English" },
          { language: "Hindi" },
          { language: "French" }
        ],
        typesOfTours: ["Cultural Tours", "Food Tours"],
        professionalSummary: "Food enthusiast and culture lover. I specialize in showing travelers the hidden culinary gems and cultural treasures of Udaipur.",
        email: "priya.patel@example.com",
        phone: "+91 98765 43211",
        profileImage: "priya-patel.jpg"
      }
    };
    
    return sampleGuides[id] || sampleGuides["1"];
  };

  // Data mapping function
  const mapGuideData = (data, guideId) => {
    return {
      name: data.fullName || data.name || `Guide ${guideId}`,
      location: `${data.city || ""}, ${data.state || ""}`.replace(/^,\s*|\s*,$/g, ''),
      experience: data.workExperience?.[0]?.years || data.experience || 3,
      
      languages: {
        primary: data.languageProficiency?.[0]?.language || "English",
        secondary: data.languageProficiency?.slice(1).map(lang => lang.language) || ["Hindi", "German"]
      },
      
      rating: 4.9,
      reviewCount: 127,
      
      specialties: data.typesOfTours || ["Cultural Tours", "Historical Sites"],
      
      about: {
        description: data.professionalSummary || "Experienced local guide passionate about sharing culture and history with travelers."
      },
      
      certifications: [
        { name: "Certified Professional Tour Guide", organization: "Ministry of Tourism, Government of India" },
        { name: "First Aid Certified", organization: "Red Cross India" },
        { name: "Heritage Interpretation Specialist", organization: "UNESCO Training Program" }
      ],
      
      maxGroupSize: 8,
      
      contact: {
        email: data.email || `guide${guideId}@example.com`,
        phone: data.phone || "+91 98765 43210"
      }
    };
  };

  // Calendar functions for October 2025 (as shown in screenshot)
  const generateOctober2025Calendar = () => {
    const calendar = [];
    
    // October 2025 starts on Wednesday (index 3), so we need to fill previous month's days
    // September 2025 has 30 days
    for (let i = 28; i <= 30; i++) {
      calendar.push(new Date(2025, 8, i)); // September dates (month 8)
    }
    
    // October 2025 days
    for (let day = 1; day <= 31; day++) {
      calendar.push(new Date(2025, 9, day));
    }
    
    // November 2025 first day
    calendar.push(new Date(2025, 10, 1));
    
    return calendar;
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleBookNow = async () => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    try {
      const bookingData = {
        guideId: guideId,
        guideName: guide?.name,
        date: selectedDate.toISOString().split('T')[0],
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        alert('Booking request sent successfully! The guide will contact you soon.');
      } else {
        throw new Error('Booking failed');
      }
    } catch (err) {
      alert('Failed to send booking request. Please try again.');
    }
  };

  const handleSendMessage = () => {
    alert(`Message feature would open here. ${guide?.name} will be notified.`);
  };

  if (loading) {
    return (
      <div className="loading">
        <h3>Loading Guide Details...</h3>
        <p>Guide ID: {guideId}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Guide Not Available</h3>
        <p>{error}</p>
        <button onClick={() => window.history.back()} className="btn btn-primary">
          ← Back to Guides
        </button>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="error">
        <h3>Guide Not Found</h3>
        <button onClick={() => window.history.back()} className="btn btn-outline">
          ← Back to Guides
        </button>
      </div>
    );
  }

  const calendar = generateOctober2025Calendar();

  return (
    <div className="guidedetail-container">
      {/* Header */}
      <div className="guide-header">
        <div className="back-button" onClick={() => window.history.back()}>
          # Back to Guides
        </div>
        
        <div className="guide-main-info">
          <div className="guide-basic-info">
            <h1>{guide.name}</h1>
            <div className="location-experience">
              <span className="location">- {guide.location}</span>
              <span className="experience">- {guide.experience}+ years Experience</span>
            </div>
          </div>
          
          <div className="language-rating-section">
            <div className="primary-language">
              <h3>{guide.languages.primary}</h3>
              <div className="rating">
                <strong>{guide.rating}</strong> ({guide.reviewCount} reviews)
              </div>
            </div>
            
            <div className="other-languages-table">
              <table>
                <tbody>
                  <tr>
                    {guide.languages.secondary.map((lang, index) => (
                      <td key={index}>{lang}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="specialties-section">
          {guide.specialties.map((specialty, index) => (
            <strong key={index} className="specialty-item">{specialty}</strong>
          ))}
        </div>
      </div>

      <hr className="divider" />

      {/* Navigation Tabs */}
      <div className="tabs-navigation">
        <button 
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <strong>About</strong>
        </button>
        <button 
          className={`tab ${activeTab === 'tours' ? 'active' : ''}`}
          onClick={() => setActiveTab('tours')}
        >
          <strong>Tours</strong>
        </button>
        <button 
          className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <strong>Gallery</strong>
        </button>
        <button 
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <strong>Reviews</strong>
        </button>
      </div>

      <hr className="divider" />

      <div className="main-content-layout">
        {/* Left Content Area */}
        <div className="content-area">
          {activeTab === 'about' && (
            <div className="about-content">
              <h2>About Me</h2>
              <p className="description">{guide.about.description}</p>
              
              <p className="extended-description">
                With over {guide.experience} years of experience as a professional tour guide, I have had the privilege of showing thousands of travelers the beauty and rich heritage of my beloved city. My passion for history, culture, and storytelling drives me to create unique and memorable experiences for every guest.
              </p>
              
              <p className="extended-description">
                I believe that travel is not just about seeing places, but about understanding the stories, traditions, and people that make each destination special. I look forward to sharing my knowledge and love for this incredible region with you!
              </p>
              
              <div className="certifications-section">
                <h3>Certifications & Achievements</h3>
                <div className="certifications-list">
                  {guide.certifications.map((cert, index) => (
                    <div key={index} className="certification-item">
                      <span className="checkbox">[ ]</span>
                      <div className="certification-details">
                        <div className="certification-name">{cert.name}</div>
                        <div className="certification-org">{cert.organization}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tours' && (
            <div className="tours-content">
              <h2>Available Tours</h2>
              <div className="tour-items">
                <div className="tour-item">
                  <h4>Cultural Heritage Tour</h4>
                  <p>Explore the rich cultural heritage and traditions of Rajasthan</p>
                  <div className="tour-meta">
                    <span>4 hours</span>
                    <span>$50 per person</span>
                  </div>
                </div>
                <div className="tour-item">
                  <h4>Historical Sites Tour</h4>
                  <p>Visit ancient forts and palaces with detailed historical context</p>
                  <div className="tour-meta">
                    <span>6 hours</span>
                    <span>$75 per person</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="gallery-content">
              <h2>Gallery</h2>
              <div className="gallery-grid">
                <div className="gallery-item">[Guide Photo 1]</div>
                <div className="gallery-item">[Guide Photo 2]</div>
                <div className="gallery-item">[Tour Photo 1]</div>
                <div className="gallery-item">[Tour Photo 2]</div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <h2>Customer Reviews</h2>
              <div className="review-items">
                <div className="review-item">
                  <div className="review-header">
                    <strong>Sarah Johnson</strong>
                    <span className="review-rating">★★★★★</span>
                  </div>
                  <p className="review-text">"Amazing guide! Very knowledgeable and friendly. Made our trip memorable."</p>
                  <span className="review-date">January 15, 2024</span>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <strong>Mike Chen</strong>
                    <span className="review-rating">★★★★☆</span>
                  </div>
                  <p className="review-text">"Great historical insights and excellent storytelling skills."</p>
                  <span className="review-date">January 10, 2024</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Booking Section */}
        <div className="booking-sidebar">
          <div className="calendar-widget">
            <h3>Select Date</h3>
            <div className="month-header">
              [ ] October 2025
            </div>
            <div className="calendar">
              <div className="week-days">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>
              <div className="calendar-days">
                {calendar.map((date, index) => (
                  <div
                    key={index}
                    className={`calendar-day ${
                      date.getMonth() !== 9 ? 'other-month' : ''
                    } ${
                      selectedDate && date.getTime() === selectedDate.getTime() ? 'selected' : ''
                    }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    {date.getDate()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="quick-info-widget">
            <h3>Quick Info</h3>
            <ul>
              <li>- Flexible timing</li>
              <li>- Max {guide.maxGroupSize} people</li>
              <li>- Free cancellation</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button className="book-now-button" onClick={handleBookNow}>
              Book Now
            </button>
            <button className="message-button" onClick={handleSendMessage}>
              Send Message
            </button>
          </div>

          <div className="contact-widget">
            <h3>Contact Information</h3>
            <p>Email: {guide.contact.email}</p>
            <p>Phone: {guide.contact.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guidedetail;