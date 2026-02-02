import React, { useEffect, useState } from "react";
import { guideEarnings, guidePayouts } from "../../services/guideService";
import { getUserData } from "../../utils/storage";

function GuideEarnings() {
  const [summary, setSummary] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const guide = getUserData("guide");
  console.log("guides in earning", guide);

  useEffect(() => {
    fetchEarningData();
    fetchPayoutData();
  }, []);

  const fetchEarningData = async () => {
    try {
      const earningsRes =await guideEarnings(guide.guideId);
      console.log("resp of earning", earningsRes);
      setSummary(earningsRes?.data?.summary);
      setEarnings(earningsRes?.data?.earnings);
    } catch (err) {
      console.log("err in fething earning data", err?.response?.data);
    }
  };
  const fetchPayoutData = async () => {
    try {
      const payoutsRes =await guidePayouts(guide.guideId);
      console.log("resp of payouts", payoutsRes);
      setPayouts(payoutsRes?.data?.payouts);
    } catch (err) {
      console.log("err in fething earning data", err.response?.data);
    }
  };

  if (!summary) return <p>Loading...</p>;

  return (
    <>
      {/* Summary */}
      <div className="row mb-4">
        <div className="col">Total Earned: ₹{summary.totalEarned}</div>
        <div className="col">Paid: ₹{summary.totalPaid}</div>
        <div className="col">Remaining: ₹{summary.remainingAmount}</div>
        <div className="col">Status: {summary.payoutStatus}</div>
      </div>

      {/* Earnings Table */}
      <h5>Earning History</h5>
      <table className="table">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {earnings.map((e) => (
            <tr key={e.id}>
              <td>{e.bookingId}</td>
              <td>₹{e.guidePayableAmount}</td>
              <td>{e.payoutStatus}</td>
              <td>{new Date(e.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payouts Table */}
      <h5 className="mt-4">Payout History</h5>
      <table className="table">
        <thead>
          <tr>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((p) => (
            <tr key={p.id}>
              <td>₹{p.paidAmount}</td>
              <td>{p.paymentMethod}</td>
              <td>{p.paymentStatus}</td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default GuideEarnings;
