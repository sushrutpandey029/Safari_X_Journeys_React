import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUserData } from "../../utils/storage";
import { guideApplyLeave } from "../../services/guideService";

const ApplyLeave = () => {
  const [guide, setGuide] = useState(null);
  const [formData, setFormData] = useState({
    guideId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Load guide data from localStorage
  useEffect(() => {
    const storedGuide = getUserData("guide");
    console.log("guide", storedGuide);
    if (storedGuide) {
      setGuide(storedGuide);
      setFormData((prev) => ({
        ...prev,
        guideId: storedGuide.guideId,
      }));
    }
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Submit leave request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // const res = await axios.post(
      //   "http://localhost:5000/guide/unavailable",
      //   formData
      // );
      const res = await guideApplyLeave(formData);

      if (res.data.success) {
        setSuccess("Leave applied successfully");
        setFormData({
          guideId: guide.guideId,
          startDate: "",
          endDate: "",
          reason: "",
        });
      } else {
        setError(res.data.message || "Something went wrong");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!guide) {
    return <p className="text-danger">Guide data not found</p>;
  }

  return (
    <main className="container mt-4">
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Guide Name (non-editable) */}
        <div className="mb-3">
          <label className="form-label">Guide Name</label>
          <input
            type="text"
            className="form-control"
            value={guide.fullName}
            disabled
          />
        </div>

        {/* Start Date */}
        <div className="mb-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* End Date */}
        <div className="mb-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Reason */}
        <div className="mb-3">
          <label className="form-label">Reason</label>
          <textarea
            className="form-control"
            name="reason"
            rows="3"
            value={formData.reason}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Submitting..." : "Apply Leave"}
        </button>
      </form>
    </main>
  );
};

export default ApplyLeave;
