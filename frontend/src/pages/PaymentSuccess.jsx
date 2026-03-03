import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { bookingService } from "../services/api";
import styles from "./Payment.module.css";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!bookingId || !sessionId) {
      setErrorMsg("Буруу холбоос.");
      setStatus("error");
      return;
    }
    bookingService
      .verifyCheckout({ bookingId, sessionId })
      .then(() => setStatus("success"))
      .catch((err) => {
        setErrorMsg(
          err.response?.data?.message || "Баталгаажуулахад алдаа гарлаа.",
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
            Төлбөр баталгаажуулж байна...
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
            Нүүр хуудас
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.successBox}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>Таны аялал баталгаажлаа!</h2>
          <p className={styles.successMsg}>
            Баталгаажуулах имэйл таны хаяг руу илгээгдлээ. Бид удахгүй
            дэлгэрэнгүй мэдээлэл үлдээнэ.
          </p>
          <p className={styles.successSub}>
            Бидэнд итгэснэд баярлалаа — сайхан аялал хүсье! ✈️
          </p>
          <button className={styles.homeBtn} onClick={() => navigate("/")}>
            Нүүр хуудас руу буцах
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
