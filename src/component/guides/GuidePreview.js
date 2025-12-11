import { getAllGuides } from "../services/guideService";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GuideCard from "./GuideCard";

const GuidePreview = () => {
  const [guides, setGuides] = useState([]);

  const fetchAllGuides = async () => {
    try {
      const response = await getAllGuides();
      const filteredGuide = response?.data?.slice(0, 4);
      setGuides(filteredGuide);
    } catch (err) {
      console.log("err in respone", err);
    }
  };

  useEffect(() => {
    fetchAllGuides();
  }, []);

  return (
<div className="best-guide modern-best-guide">
  <div className="container">
    <div className="row align-items-center mb-4">
      <div className="col-sm-9">
        <h2 className="title-modern">
          Our <span>Best Guide</span>
        </h2>
        <p className="perra-modern">
          Our experienced travel guides bring destinations to life with rich
          stories, local insights, and hidden gems. They help you navigate
          new places confidently, ensuring every journey is smooth and
          memorable.
        </p>
      </div>

      <div className="col-sm-3 text-end">
        <Link to="/guides">
          <button className="explore-btn-modern">Explore More</button>
        </Link>
      </div>
    </div>

    <div className="row gy-4">
      {guides && guides.map((guide) => <GuideCard guide={guide} />)}
    </div>
  </div>
</div>

  );
};
export default GuidePreview;
