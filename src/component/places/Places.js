import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Places.css";

// 🔹 Normalize function (IMPORTANT)
const normalizeName = (name) =>
  name?.toLowerCase().replace(/\s+/g, " ").trim();

// 🔹 City → Image mapping
const cityImages = {
  "shimla, himachal pradesh": "/Images/shimla.jpg",
  "manali, himachal pradesh": "/Images/manali.jpg",
  "srinagar, jammu and kashmir": "/Images/srinagar.jpg",
  "darjeeling, west bengal": "/Images/darjeeling.jpg",
  "munnar, kerala": "/Images/munnar.jpg",
  "ooty, tamil nadu": "/Images/ooty.jpg",
  "mussoorie, uttarakhand": "/Images/mussoorie.jpg",
  "leh, jammu and kashmir": "/Images/leh.jpg",

  "varanasi, uttar pradesh": "/Images/varanasi.jpg",
  "srikalahasti": "/Images/srikalahasti.jpg",
  "hampi, karnataka": "/Images/hampi.jpg",
  "prayagraj (formally-allahabad), uttar pradesh": "/Images/prayagraj.jpg",
  "kedarnath, uttarakhand": "/Images/kedarnath.jpg",
  "vrindavan, uttar pradesh": "/Images/vrindavan.jpg",
  "rishikesh, uttarakhand": "/Images/rishikesh.jpg",
  "gokul, mathura": "/Images/gokul.jpg",

  "auli, uttarakhand": "/Images/auli.jpg",
  "gangtok, sikkim": "/Images/gangtok.jpg",
  "alleppey/alappuzha, kerala": "/Images/alleppey.jpg",
  "coorg, karnataka": "/Images/coorg.jpg",
  "gulmarg, jammu and kashmir": "/Images/gulmarg.jpg",
  "dalhousie, himachal pradesh": "/Images/dalhousie.jpg",

  "kutch, gujarat": "/Images/kutch.jpg",
  "jaisalmer, rajasthan": "/Images/jaisalmer.jpg",
  "barmer, rajasthan": "/Images/barmer.jpg",
  "wuste thar, rajasthan": "/Images/thar.jpg",
  "jodhpur, rajasthan": "/Images/jodhpur.jpg",
  "khimsar, rajasthan": "/Images/khimsar.jpg",
  "jaipur, rajasthan": "/Images/jaipur.jpg",

  "dharamshala, himachal pradesh": "/Images/dharamshala.jpg",
  "kasauli, himachal pradesh": "/Images/kasauli.jpg",
  "madikeri, karnataka": "/Images/madikeri.jpg",
  "nainital, uttarakhand": "/Images/nainital.jpg",
  "lonavala, maharashtra": "/Images/lonavala.jpg",
  "matheran, maharashtra": "/Images/matheran.jpg",
  "ranikhet, uttarakhand": "/Images/ranikhet.jpg",
};

function Places() {
  const location = useLocation();
  const navigate = useNavigate();
  const { category } = location.state || {};

  if (!category) return <p>No category selected</p>;

  const handleCityClick = (city) => {
    navigate("/hotel-list", {
      state: {
        city: city.code,
        cityName: city.name,
        country: "IN",
      },
    });
  };

  return (
    <div className="place-box">
      <div className="container py-5">
        <div className="row mb-4" style={{ marginTop: "100px" }}>
          <div className="col-sm-8">
            <h2>{category.category} Destinations</h2>
          </div>
        </div>

        <div className="row g-4">
          {category.cities.map((city) => (
            <div className="col-md-3" key={city.code}>
              <div
                className="card h-100 shadow-sm rounded-4 border"
                style={{ cursor: "pointer" }}
                onClick={() => handleCityClick(city)}
              >
                <img
                  src={
                    cityImages[normalizeName(city.name)] ||
                    "/Images/default.jpg"
                  }
                  className="card-img-top rounded-top-4"
                  alt={city.name}
                />

                <div className="card-body">
                  <h5 className="fw-bold">{city.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Places;
