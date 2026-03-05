import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Payment.module.css";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
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
  );
};

export default PaymentSuccess;
