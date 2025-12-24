import React, { useEffect, useState } from "react";
import { guideLeaveHistory } from "../../services/guideService";
import { getUserData } from "../../utils/storage";

function LeaveHistory() {
  const [leaveData, setLeaveData] = useState(null);
  const [activeTab, setActiveTab] = useState("current");
  const [loading, setLoading] = useState(true);

  const fetchLeaveHistory = async () => {
    try {
      const guide = await getUserData("guide");
      const res = await guideLeaveHistory(guide.guideId);
      console.log("guide leave", res.data);
      setLeaveData(res.data);
    } catch (err) {
      console.log("error in getting leave history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  if (loading) return <p>Loading leave history...</p>;
  if (!leaveData) return <p>No data available</p>;

  const { pastLeaves, presentLeaves, futureLeaves, counts } = leaveData;

  const renderLeaves = (leaves) => {
    if (!leaves || leaves.length === 0) {
      return <p className="text-muted">No leaves found</p>;
    }

    return (
      <div className="row">
        {leaves.map((leave) => (
          <div className="col-md-6 mb-3" key={leave.id}>
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-2">
                  {leave.startDate} → {leave.endDate}
                </h6>
                <p className="mb-1">
                  <strong>Reason:</strong> {leave.reason || "—"}
                </p>
                <small className="text-muted">
                  Applied on: {new Date(leave.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Leave History</h3>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "current" ? "active" : ""}`}
            onClick={() => setActiveTab("current")}
          >
            Current ({counts.present})
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "future" ? "active" : ""}`}
            onClick={() => setActiveTab("future")}
          >
            Upcoming ({counts.future})
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past ({counts.past})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === "current" && renderLeaves(presentLeaves)}
      {activeTab === "future" && renderLeaves(futureLeaves)}
      {activeTab === "past" && renderLeaves(pastLeaves)}
    </div>
  );
}

export default LeaveHistory;
