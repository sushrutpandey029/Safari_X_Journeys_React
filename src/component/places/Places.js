import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Places.css";

// 🔹 Normalize function (IMPORTANT)
const normalizeName = (name) =>
  name?.toLowerCase().replace(/\s+/g, " ").trim();

// 🔹 City → Image mapping
const cityImages = {
  "shimla, himachal pradesh": "/images/shimla.jpg",
  "manali, himachal pradesh": "/images/manali.jpg",
  "srinagar, jammu and kashmir": "/images/srinagar.jpg",
  "darjeeling, west bengal": "/images/darjeeling.jpg",
  "munnar, kerala": "/images/munnar.jpg",
  "ooty, tamil nadu": "/images/ooty.jpg",
  "mussoorie, uttarakhand": "/images/mussoorie.jpg",
  "leh, jammu and kashmir": "/images/leh.jpg",

  "varanasi, uttar pradesh": "/images/varanasi.jpg",
  "srikalahasti": "/images/srikalahasti.jpg",
  "hampi, karnataka": "/images/hampi.jpg",
  "prayagraj (formally-allahabad), uttar pradesh": "/images/prayagraj.jpg",
  "kedarnath, uttarakhand": "/images/kedarnath.jpg",
  "vrindavan, uttar pradesh": "/images/vrindavan.jpg",
  "rishikesh, uttarakhand": "/images/rishikesh.jpg",
  "gokul, mathura": "/images/gokul.jpg",

  "auli, uttarakhand": "/images/auli.jpg",
  "gangtok, sikkim": "/images/gangtok.jpg",
  "alleppey/alappuzha, kerala": "/images/alleppey.jpg",
  "coorg, karnataka": "/images/coorg.jpg",
  "gulmarg, jammu and kashmir": "/images/gulmarg.jpg",
  "dalhousie, himachal pradesh": "/images/dalhousie.jpg",

  "kutch, gujarat": "/images/kutch.jpg",
  "jaisalmer, rajasthan": "/images/jaisalmer.jpg",
  "barmer, rajasthan": "/images/barmer.jpg",
  "wuste thar, rajasthan": "/images/thar.jpg",
  "jodhpur, rajasthan": "/images/jodhpur.jpg",
  "khimsar, rajasthan": "/images/khimsar.jpg",
  "jaipur, rajasthan": "/images/jaipur.jpg",

  "dharamshala, himachal pradesh": "/images/dharamshala.jpg",
  "kasauli, himachal pradesh": "/images/kasauli.jpg",
  "madikeri, karnataka": "/images/madikeri.jpg",
  "nainital, uttarakhand": "/images/nainital.jpg",
  "lonavala, maharashtra": "/images/lonavala.jpg",
  "matheran, maharashtra": "/images/matheran.jpg",
  "ranikhet, uttarakhand": "/images/ranikhet.jpg",
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
                    "/images/default.jpg"
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
