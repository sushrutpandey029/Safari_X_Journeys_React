import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Flight_FareRule } from "../services/flightService";
import "./Flights.css";

const getRouteLabel = (fareRuleItem) => {
  const rule = fareRuleItem?.rules?.[0];
  if (!rule?.Origin || !rule?.Destination) return "";
  return `${rule.Origin} → ${rule.Destination}`;
};

const FlightDetail = ({ flightContext, showModal, onHide }) => {
  const navigate = useNavigate();
  const [showFullRule, setShowFullRule] = useState(null);
  const {
    TraceId,
    tripType,
    isDomestic,
    resultIndexes,
    pricingBreakdown,
    routes = {},
  } = flightContext || {};

  const [fareRules, setFareRules] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ===============================
     FETCH FARE RULES
  =============================== */
  useEffect(() => {
    if (!showModal || !TraceId) return;

    const fetchFareRules = async () => {
      setLoading(true);
      setError(null);
      setFareRules([]);
      setSelectedIndexes({});
      setActiveTab(0);

      try {
        let indexesToCall = [];

        if (tripType === "round" && isDomestic) {
          indexesToCall = [resultIndexes?.outbound, resultIndexes?.inbound];
        } else {
          indexesToCall = Array.isArray(resultIndexes)
            ? resultIndexes
            : [resultIndexes];
        }

        const responses = [];

        for (const index of indexesToCall) {
          if (!index) continue;

          const res = await Flight_FareRule({
            TraceId,
            ResultIndex: index,
          });
          console.log("farerule reps", res);
          responses.push({
            ResultIndex: index,
            rules: res?.data?.Response?.FareRules || [],
          });
        }

        setFareRules(responses);
      } catch (err) {
        setError("Failed to fetch fare rules", err.response);
      } finally {
        setLoading(false);
      }
    };

    fetchFareRules();
  }, [showModal, TraceId, tripType, isDomestic, resultIndexes]);

  /* ===============================
     SELECTION
  =============================== */
  const handleSelect = (tabIndex, resultIndex) => {
    setSelectedIndexes((prev) => ({
      ...prev,
      [tabIndex]: resultIndex,
    }));
  };

  const canContinue =
    tripType === "round" && isDomestic
      ? selectedIndexes[0] && selectedIndexes[1]
      : selectedIndexes[0];

  /* ===============================
     CONTINUE
  =============================== */
  const handleContinue = () => {
    navigate("/flight-checkout", {
      state: {
        TraceId,
        tripType,
        isDomestic,
        pricingBreakdown,
        passengerCount: flightContext?.passengers,
        resultIndexes:
          tripType === "round" && isDomestic
            ? {
                outbound: selectedIndexes[0],
                inbound: selectedIndexes[1],
              }
            : selectedIndexes[0],
      },
    });

    onHide();
  };

  const extractFareSummary = (fareRule) => {
    const miniRules = fareRule?.MiniFarRules?.Rules || [];
    const currency = fareRule?.MiniFarRules?.Currency || "INR";

    const getFee = (type, departureType) => {
      const match = miniRules.find(
        (r) =>
          r.Type === type &&
          r.DepartureType.toLowerCase().includes(departureType.toLowerCase()),
      );
      return match?.PaxPenalties?.[0]?.AirlineFee ?? null;
    };

    const refundFee = getFee(0, "Before Departure");
    const changeFee = getFee(1, "Before Departure");
    const noShowFee = getFee(1, "No Show");

    return {
      airline: fareRule.Airline,
      departureTime: fareRule.DepartureTime,
      fareBasis: fareRule.FareBasisCode,
      origin: fareRule.Origin,
      destination: fareRule.Destination,
      route: `${fareRule.Origin} → ${fareRule.Destination}`,
      currency,
      refundFee,
      changeFee,
      noShowFee,
      isRefundable: refundFee !== null && refundFee !== 0,
      fullHTML: fareRule.FareRuleDetail,
    };
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <Modal
      show={showModal}
      onHide={onHide}
      size="lg"
      centered
      scrollable
      dialogClassName="modern-flight-modal"
    >
      {/* ================= HEADER ================= */}
      <Modal.Header closeButton className="modern-modal-header">
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-white">Flight Fare Options</h5>
            <Badge bg="primary">{tripType?.toUpperCase()}</Badge>
          </div>

          {isDomestic && tripType === "round" && (
            <Badge bg="secondary" className="mt-2">
              Domestic Return
            </Badge>
          )}

          <small className="plan-booking d-block mt-2">
            Please select plan to continue booking
          </small>
        </div>
      </Modal.Header>

      {/* ================= BODY ================= */}
      <Modal.Body className="modern-modal-body">
        {loading && (
          <div className="d-flex flex-column justify-content-center align-items-center py-5 w-100">
            <Spinner animation="border" />
            <p className="mt-2">Fetching fare rules…</p>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {/* ===== DEPART / RETURN TABS ===== */}
        {!loading && fareRules.length > 1 && (
          <div className="fare-tabs mb-4 d-flex gap-2 flex-wrap">
            {fareRules.map((item, idx) => {
              const routeLabel = getRouteLabel(item);

              return (
                <Button
                  key={idx}
                  className={`modern-tab-btn ${
                    activeTab === idx ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(idx)}
                >
                  {idx === 0
                    ? `DEPART : ${routeLabel}`
                    : `RETURN : ${routeLabel}`}
                </Button>
              );
            })}
          </div>
        )}

        {/* ===== FARE RULE CARDS ===== */}
        {!loading && fareRules.length > 0 && (
          <div className="fare-card-container">
            {fareRules.map((item, idx) => {
              const rule = item.rules?.[0];
              if (!rule) return null;

              const summary = extractFareSummary(rule);

              const isSelected = selectedIndexes[idx] === item.ResultIndex;

              return (
                <div
                  key={idx}
                  className={`fare-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(idx, item.ResultIndex)}
                >
                  {/* Label */}
                  <div className="fare-type-label">
                    {tripType === "round"
                      ? idx === 0
                        ? "DEPART FLIGHT"
                        : "RETURN FLIGHT"
                      : "FLIGHT"}
                  </div>

                  {/* Route */}
                  <div className="fare-route">
                    {summary.origin} → {summary.destination}
                  </div>

                  {/* Airline */}
                  <div className="fare-airline">Airline: {summary.airline}</div>

                  {/* Departure */}
                  <div className="fare-airline">
                    Departure:{" "}
                    {new Date(summary.departureTime).toLocaleString()}
                  </div>

                  {/* Refund badge */}
                  <div
                    className={`fare-badge ${
                      summary.isRefundable ? "refundable" : "non-refundable"
                    }`}
                  >
                    {summary.isRefundable ? "Refundable" : "Non-Refundable"}
                  </div>

                  {/* Fees */}
                  <div className="fare-body">
                    <div className="fare-row">
                      <span>Cancellation</span>
                      <span>
                        {summary.refundFee === null
                          ? "Not Allowed"
                          : summary.refundFee === 0
                            ? "Free"
                            : `₹${summary.refundFee}`}
                      </span>
                    </div>

                    <div className="fare-row">
                      <span>Change</span>
                      <span>
                        {summary.changeFee === null
                          ? "Not Allowed"
                          : summary.changeFee === 0
                            ? "Free"
                            : `₹${summary.changeFee}`}
                      </span>
                    </div>

                    <div className="fare-row">
                      <span>No-show</span>
                      <span>
                        {summary.noShowFee === null
                          ? "Not Allowed"
                          : summary.noShowFee === 0
                            ? "Free"
                            : `₹${summary.noShowFee}`}
                      </span>
                    </div>
                  </div>

                  {/* Read More */}
                  <Button
                    variant="link"
                    onClick={(e) => {
                      e.stopPropagation();

                      setShowFullRule((prev) => (prev === idx ? null : idx));
                    }}
                  >
                    {showFullRule === idx ? "Hide Details" : "Read More"}
                  </Button>

                  {showFullRule === idx && (
                    <div
                      className="fare-full-rule"
                      dangerouslySetInnerHTML={{
                        __html: summary.fullHTML,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* {!loading &&
          fareRules[activeTab] &&
          (fareRules[activeTab].rules.length > 0 ? (
            fareRules[activeTab].rules.map((rule, rIdx) => (
              <div
                key={rIdx}
                className={`modern-fare-card ${
                  selectedIndexes[activeTab] ===
                  fareRules[activeTab].ResultIndex
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelect(activeTab, fareRules[activeTab].ResultIndex)
                }
              >
                <div
                  className="fare-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      rule.FareRuleDetail ||
                      "<p>No detailed fare rule provided.</p>",
                  }}
                />
              </div>
            ))
          ) : (
            <div className="segment">
              No fare rules available for this segment.
            </div>
          ))} */}
      </Modal.Body>

      {/* ================= FOOTER ================= */}
      <Modal.Footer className="modern-modal-footer">
        <Button
          className="continue-btn-modern"
          onClick={handleContinue}
          disabled={!canContinue || loading}
        >
          Continue Booking →
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FlightDetail;
