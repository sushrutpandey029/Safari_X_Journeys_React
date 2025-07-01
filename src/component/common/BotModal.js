// import React from "react";

// function BotModal({ toggleChat }) {
//   return (
//     <div className="chat-popup card shadow">
//       <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
//         <span>Travel Assistant</span>
//         <button className="btn btn-sm btn-light" onClick={toggleChat}>
//           <i className="bi bi-x"></i>
//         </button>
//       </div>
//       <div className="card-body">
//         <p>Hello! Need help with your payment or booking a trip? 💳✈</p>
//         <p>I can assist with methods, offers, and more.</p>
//       </div>
//     </div>
//   );
// }

// export default BotModal;

import React, { useState } from "react";

function BotModal({ toggleChat }) {
  const [formData, setFormData] = useState({
    fromDestination: "",
    toDestination: "",
    noOfAdults: "1",
    noOfChildren: "0",
    cabNeed: "Yes",
    purposeType: "Tourism",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Example: Replace this URL with your actual API endpoint
      const response = await fetch("http://192.168.1.14:2625/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage("Booking request submitted successfully! ✅");
        setData(result.result);
        console.log("API Response in bot:", result);
      } else {
        setMessage("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessage("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="chat-popup card shadow" 
      style={{ maxWidth: "400px", width: "100%",maxHeight:"450px"}}
    >
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <span>Travel Assistant</span>
        <button className="btn btn-sm btn-light" onClick={toggleChat}>
          <i className="bi bi-x"></i>
        </button>
      </div>
      <div
        className="card-body"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <p>Hello! Need help with your payment or booking a trip? 💳✈</p>
        <p>I can assist with methods, offers, and more.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label">From</label>
            <input
              type="text"
              className="form-control form-control-sm"
              name="fromDestination"
              value={formData.fromDestination}
              onChange={handleChange}
              placeholder="Delhi"
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">To</label>
            <input
              type="text"
              className="form-control form-control-sm"
              name="toDestination"
              value={formData.toDestination}
              onChange={handleChange}
              placeholder="Agra"
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Number of Adults</label>
            <input
              type="number"
              className="form-control form-control-sm"
              name="noOfAdults"
              value={formData.noOfAdults}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Number of Children</label>
            <input
              type="number"
              className="form-control form-control-sm"
              name="noOfChildren"
              value={formData.noOfChildren}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Need Cab?</label>
            <select
              className="form-select form-select-sm"
              name="cabNeed"
              value={formData.cabNeed}
              onChange={handleChange}
              required
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Purpose</label>
            <select
              className="form-select form-select-sm"
              name="purposeType"
              value={formData.purposeType}
              onChange={handleChange}
              required
            >
              <option value="Tourism">Tourism</option>
              <option value="Business">Business</option>
              <option value="Family Visit">Family Visit</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            className="explore-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          {/* {message && <div className="mt-2 alert alert-info">{message}</div>} */}
          {data && <p>{data}</p>}
        </form>
      </div>
    </div>
  );
}

export default BotModal;
