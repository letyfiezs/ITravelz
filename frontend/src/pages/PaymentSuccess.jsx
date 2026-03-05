import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { bookingService } from "../services/api";
import styles from "./Payment.module.css";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!bookingId || !sessionId) {
      setErrorMsg("Invalid link. Booking information not found.");
      setStatus("error");
      return;
    }

    bookingService
      .verifyCheckout({ bookingId, sessionId })
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          "Failed to verify payment. Please try again or contact support.";
        setErrorMsg(msg);
        setStatus("error");
      });
  }, [bookingId, sessionId]);

  if (status === "verifying") {
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
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorMsg}>{errorMsg}</p>
          <button className={styles.homeBtn} onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.successIcon}>🎉</div>
        <h2 className={styles.successTitle}>Your trip is confirmed!</h2>
        <p className={styles.successMsg}>
          A confirmation email has been sent to your inbox. We'll follow up
          with detailed itinerary information soon.
        </p>
        <p className={styles.successSub}>
          Thank you for choosing us — have an amazing adventure! ✈️
        </p>
        <button className={styles.homeBtn} onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
