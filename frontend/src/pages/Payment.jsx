import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { bookingService } from "../services/api";
import styles from "./Payment.module.css";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setFetchError("Invalid link. Booking ID not found.");
      setLoading(false);
      return;
    }
    bookingService
      .getByRef(bookingId)
      .then((res) => {
        const b = res.data.data;
        if (b.status !== "approved") {
          setFetchError("This booking is not available for payment. Status: " + b.status);
        } else if (b.paymentStatus === "paid") {
          setFetchError("Payment has already been completed for this booking.");
        }
        setBooking(b);
      })
      .catch(() => setFetchError("Booking not found. The link may be invalid."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    setPayError("");
    setRedirecting(true);
    try {
      const res = await bookingService.createCheckoutSession({ bookingId });
      window.location.href = res.data.url;
    } catch (err) {
      setPayError(err.response?.data?.message || "An error occurred. Please try again.");
      setRedirecting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <p style={{ textAlign: "center", color: "#6b7280" }}>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking || fetchError) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>warning</div>
          <p className={styles.errorMsg}>{fetchError || "Something went wrong."}</p>
          <button className={styles.homeBtn} onClick={() => navigate("/")}>Go to Home</button>
        </div>
      </div>
    );
  }

  const amount = booking.totalPrice || booking.price || 0;
  const travelDate = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "-";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Confirm Your Trip</h1>
        <p className={styles.subtitle}>
          Review your booking and complete payment to secure your reservation.
        </p>

        <div className={styles.summary}>
          <h3 className={styles.sectionLabel}>Booking Details</h3>
          <div className={styles.row}>
            <span>Booking ID</span>
            <strong>{booking.bookingId}</strong>
          </div>
          <div className={styles.row}>
            <span>Package / Tour</span>
            <strong>{booking.serviceName}</strong>
          </div>
          <div className={styles.row}>
            <span>Travel Date</span>
            <strong>{travelDate}</strong>
          </div>
          {booking.bookingTime && (
            <div className={styles.row}>
              <span>Time</span>
              <strong>{booking.bookingTime}</strong>
            </div>
          )}
          <div className={styles.row}>
            <span>Guests</span>
            <strong>{booking.numberOfPeople}</strong>
          </div>
          {booking.duration && booking.duration !== "N/A" && (
            <div className={styles.row}>
              <span>Duration</span>
              <strong>{booking.duration}</strong>
            </div>
          )}
          {amount > 0 && (
            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>Total Amount</span>
              <strong className={styles.amount}>${amount.toLocaleString()}</strong>
            </div>
          )}
        </div>

        {payError && <p className={styles.errorMsg}>{payError}</p>}

        <button
          className={styles.payBtn}
          onClick={handlePay}
          disabled={redirecting}
        >
          {redirecting ? "Redirecting to Stripe..." : `Pay with Stripe - $${amount.toLocaleString()}`}
        </button>

        <p className={styles.stripeNote}>
          Secured by Stripe. Your card details are never stored on this site.
        </p>
      </div>
    </div>
  );
};

export default Payment;
