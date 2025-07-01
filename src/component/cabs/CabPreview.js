import React, { useState, useEffect } from "react";
import { fetchCabList } from "../services/cabService";
import { BASE_URL } from "../services/apiEndpoints";
import { Link } from "react-router-dom";

function CabPreview() {
  const [cabData, setCabData] = useState([]);

  const getCabList = async () => {
    try {
      const resp = await fetchCabList();
      console.log("response in cab list", resp.data);
      setCabData(resp.data);
    } catch (err) {
      console.log("err in listing cab", err.response);
    }
  };

  useEffect(() => {
    getCabList();
  }, []);

  return (
    <div className="best-cab">
      <div className="container">
        <div className="row">
          <div className="col-sm-9">
            <h2>
              find the <span>best cabs </span>
            </h2>
            <p className="perra">
              Lorem ipsum dolor sit amet consectetur. Porttitor dolor malesuada
              sodales convallis nisi odio malesuada adipiscing. Etiam Lorem
              ipsum dolor sit amet consectetur. Porttitor dolor malesuada
            </p>
          </div>
          <div className="col-sm-3 text-end">
            <Link to={"#"}>
              <button className="explore-btn">Explore More</button>
            </Link>
          </div>

          {cabData.slice(0, 4).map((cab, index) => (
            <div className="col-md-3 mb-4" key={index}>
              <div className="cab-box">
                <img
                  src={`${BASE_URL}/cab/images/${cab.imagePath}`}
                  alt={cab.name}
                  className="img-fluid"
                />
                {/* <img src={cab.image} alt={cab.name} className="img-fluid" /> */}
                <div className="d-flex">
                  <h4>
                    {cab.cabtype}
                    <span>Starting- {cab.price_per_day}/day</span>
                  </h4>
                  <button className="explore-btn">BOOK NOW</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CabPreview;
