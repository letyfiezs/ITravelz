import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { bookingService } from "../services/api";
import styles from "./Payment.module.css";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!bookingId || !sessionId) {
      setMessage("Invalid payment link.");
      setStatus("error");
      return;
    }
    bookingService
      .verifyCheckout({ bookingId, sessionId })
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setMessage(
          err.response?.data?.message || "Payment verification failed.",
        );
        setStatus("error");
      });
  }, [bookingId, sessionId]);

  if (status === "loading") {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            Verifying your payment...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>warning</div>
          <p className={styles.errorMsg}>{message}</p>
          <button className={styles.homeBtn} onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.successIcon}>checkmark</div>
        <h2 className={styles.successTitle}>Payment Successful!</h2>
        <p className={styles.successMsg}>
          Your booking has been confirmed and payment received.
        </p>
        <p className={styles.successSub}>
          A confirmation email has been sent to you. We look forward to your
          trip!
        </p>
        <button
          className={styles.homeBtn}
          onClick={() => navigate("/bookings")}
        >
          View My Bookings
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
