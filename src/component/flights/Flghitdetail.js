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
  const [loading, setLoading] = useState(false);
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

          responses.push({
            ResultIndex: index,
            rules: res?.data?.Response?.FareRules || [],
          });
        }

        setFareRules(responses);
      } catch (err) {
        setError("Failed to fetch fare rules");
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
          <div className="text-center py-4">
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
                  className={`modern-tab-btn ${activeTab === idx ? "active" : ""
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
        {!loading &&
          fareRules[activeTab] &&
          (fareRules[activeTab].rules.length > 0 ? (
            fareRules[activeTab].rules.map((rule, rIdx) => (
              <div
                key={rIdx}
                className={`modern-fare-card ${selectedIndexes[activeTab] ===
                    fareRules[activeTab].ResultIndex
                    ? "active"
                    : ""
                  }`}
                onClick={() =>
                  handleSelect(
                    activeTab,
                    fareRules[activeTab].ResultIndex
                  )
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
          ))}
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
