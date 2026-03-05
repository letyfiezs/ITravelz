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
      setFetchError("Буруу холбоос. Booking ID олдсонгүй.");
      setLoading(false);
      return;
    }
    bookingService
      .getByRef(bookingId)
      .then((res) => {
        const b = res.data.data;
        if (b.status !== "approved") {
          setFetchError("Энэ захиалга төлбөр төлөх боломжгүй байна. (Статус: " + b.status + ")");
        } else if (b.paymentStatus === "paid") {
          setFetchError("Энэ захиалгын төлбөр аль хэдийн төлөгдсөн байна.");
        }
        setBooking(b);
      })
      .catch(() => setFetchError("Захиалга олдсонгүй. Холбоос буруу байж болзошгүй."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    setPayError("");
    setRedirecting(true);
    try {
      const res = await bookingService.createCheckoutSession({ bookingId });
      window.location.href = res.data.url;
    } catch (err) {
      setPayError(err.response?.data?.message || "Алдаа гарлаа. Дахин оролдоно уу.");
      setRedirecting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <p style={{ textAlign: "center", color: "#6b7280" }}>Захиалга уншиж байна...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !booking) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorMsg}>{fetchError || "Захиалга олдсонгүй."}</p>
          <button className={styles.homeBtn} onClick={() => navigate("/")}>Нүүр хуудас</button>
        </div>
      </div>
    );
  }

  const amount = booking.totalPrice || booking.price * booking.numberOfPeople || booking.price || 0;
  const travelDate = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>✈️ Аялал Баталгаажуулах</h1>
        <p className={styles.subtitle}>Захиалгаа шалгаад Stripe-аар аюулгүй төлбөр төлнө үү.</p>

        <div className={styles.summary}>
          <h3 className={styles.sectionLabel}>Захиалгын мэдээлэл</h3>
          <div className={styles.row}><span>Захиалгын дугаар</span><strong>{booking.bookingId}</strong></div>
          <div className={styles.row}><span>Багц / Аялал</span><strong>{booking.serviceName}</strong></div>
          <div className={styles.row}><span>Огноо</span><strong>{travelDate}</strong></div>
          {booking.bookingTime && <div className={styles.row}><span>Цаг</span><strong>{booking.bookingTime}</strong></div>}
          <div className={styles.row}><span>Хүний тоо</span><strong>{booking.numberOfPeople}</strong></div>
          {booking.duration && booking.duration !== "N/A" && (
            <div className={styles.row}><span>Үргэлжлэх хугацаа</span><strong>{booking.duration}</strong></div>
          )}
          {amount > 0 && (
            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>Нийт дүн</span>
              <strong className={styles.amount}>${amount.toLocaleString()}</strong>
            </div>
          )}
        </div>

        {payError && <p className={styles.payError}>{payError}</p>}

        <button className={styles.payBtn} onClick={handlePay} disabled={redirecting}>
          {redirecting ? "Stripe руу шилжиж байна..." : `💳 Stripe-аар төлөх — $${amount.toLocaleString()}`}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#9ca3af", marginTop: "12px" }}>
          Stripe-ийн аюулгүй хуудас руу шилжинэ. Картын мэдээлэл энэ сайтад хадгалагдахгүй.
        </p>
      </div>
    </div>
  );
};

export default Payment;
