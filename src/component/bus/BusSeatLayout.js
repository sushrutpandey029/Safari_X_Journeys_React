import React from "react";
import "./BusSeatLayout.css";

const BusSeatLayout = ({
  seatLayoutData,
  selectedSeats,
  onSeatSelect,
}) => {

  if (!seatLayoutData?.seats) {
    return <div className="seat-layout-loading">Loading seats...</div>;
  }

  const seats = seatLayoutData.seats;

  // separate decks
  const lowerDeck = seats.filter(seat => !seat.IsUpper);
  const upperDeck = seats.filter(seat => seat.IsUpper);

  return (
    <div className="bus-seat-container">

      {/* Driver section */}
      <div className="driver-section">
        <div className="driver-label">Driver</div>
        <div className="steering-icon">🛞</div>
      </div>

      {/* LOWER DECK */}
      <Deck
        title="Lower Deck"
        seats={lowerDeck}
        selectedSeats={selectedSeats}
        onSeatSelect={onSeatSelect}
      />

      {/* UPPER DECK */}
      {upperDeck.length > 0 && (
        <Deck
          title="Upper Deck"
          seats={upperDeck}
          selectedSeats={selectedSeats}
          onSeatSelect={onSeatSelect}
        />
      )}

    </div>
  );
};

const Deck = ({
  title,
  seats,
  selectedSeats,
  onSeatSelect
}) => {

  const maxRow = Math.max(...seats.map(s => Number(s.RowNo)));
  const maxCol = Math.max(...seats.map(s => Number(s.ColumnNo)));

  // split seats into rows
  const rows = [];

  for (let r = 0; r <= maxRow; r++) {

    const rowSeats = seats.filter(
      s => Number(s.RowNo) === r
    );

    // split left and right using column midpoint
    const mid = Math.floor(maxCol / 2);

    const leftSeats = rowSeats.filter(
      s => Number(s.ColumnNo) <= mid
    );

    const rightSeats = rowSeats.filter(
      s => Number(s.ColumnNo) > mid
    );

    rows.push({
      leftSeats,
      rightSeats
    });

  }

  return (

    <div className="deck-container">

      <div className="deck-title">
        {title}
      </div>

      <div className="deck-wrapper">

        {rows.map((row, index) => (

          <div className="seat-row" key={index}>

            {/* LEFT SIDE */}
            <div className="seat-group left">

              {row.leftSeats.map(seat =>
                renderSeat(seat, selectedSeats, onSeatSelect)
              )}

            </div>

            {/* AISLE */}
            <div className="seat-aisle" />

            {/* RIGHT SIDE */}
            <div className="seat-group right">

              {row.rightSeats.map(seat =>
                renderSeat(seat, selectedSeats, onSeatSelect)
              )}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

const renderSeat = (
  seat,
  selectedSeats,
  onSeatSelect
) => {

  const isSelected = selectedSeats.some(
    s => s.SeatIndex === seat.SeatIndex
  );

  const isAvailable = seat.SeatStatus;
  const isLadies = seat.IsLadiesSeat;
  const isMale = seat.IsMalesSeat;
  const isSleeper = seat.SeatType === 2;

  let className = "bus-seat";

  if (!isAvailable) className += " seat-booked";
  else if (isSelected) className += " seat-selected";
  else if (isLadies) className += " seat-ladies";
  else if (isMale) className += " seat-male";
  else className += " seat-available";

  if (isSleeper) className += " seat-sleeper";

  return (

    <div
      key={seat.SeatIndex}
      className={className}
      onClick={() =>
        isAvailable && onSeatSelect(seat)
      }
    >

      <div className="seat-number">
        {seat.SeatName}
      </div>

      <div className="seat-price">
        ₹{Math.round(seat.Pricing?.finalAmount || 0)}
      </div>

    </div>

  );

};




export default BusSeatLayout;
