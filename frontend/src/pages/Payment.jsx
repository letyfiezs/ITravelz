import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';
import styles from './Payment.module.css';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking]     = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading]     = useState(true);

  const [form, setForm] = useState({ email: '', transactionId: '', paymentMethod: 'bank_transfer' });
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError]   = useState('');
  const [success, setSuccess]     = useState(false);

  // Fetch booking info
  useEffect(() => {
    if (!bookingId) {
      setFetchError('Буруу холбоос. Booking ID олдсонгүй.');
      setLoading(false);
      return;
    }
    bookingService.getByRef(bookingId)
      .then((res) => {
        const b = res.data.data;
        if (b.status !== 'approved') {
          setFetchError('Энэ захиалга төлбөр төлөх боломжгүй байна. (Статус: ' + b.status + ')');
        } else if (b.paymentStatus === 'paid') {
          setFetchError('Энэ захиалгын төлбөр аль хэдийн төлөгдсөн байна.');
        }
        setBooking(b);
      })
      .catch(() => setFetchError('Захиалга олдсонгүй. Холбоос буруу байж болзошгүй.'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePay = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setPayError('Имэйл хаягаа оруулна уу.'); return; }
    setPayError('');
    setSubmitting(true);
    try {
      await bookingService.pay({
        bookingId,
        email: form.email.trim(),
        transactionId: form.transactionId.trim(),
        paymentMethod: form.paymentMethod,
      });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Алдаа гарлаа. Дахин оролдоно уу.';
      setPayError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <p>Захиалга уншиж байна...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>Таны аялал баталгаажлаа!</h2>
          <p className={styles.successMsg}>
            Баtalгаажуулах имэйл таны хаяг руу илгээгдлээ. Бид удахгүй дэлгэрэнгүй мэдээлэл үлдээнэ.
          </p>
          <p className={styles.successSub}>Бидэнд итгэснэд баярлалаа — сайхан аялал хүсье! ✈️</p>
          <button className={styles.homeBtn} onClick={() => navigate('/')}>
            Нүүр хуудас руу буцах
          </button>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorMsg}>{fetchError}</p>
          <button className={styles.homeBtn} onClick={() => navigate('/')}>Нүүр хуудас</button>
        </div>
      </div>
    );
  }

  const amount = booking.totalPrice || (booking.price * booking.numberOfPeople) || booking.price || 0;
  const travelDate = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>✈️ Аялал Баталгаажуулах</h1>
        <p className={styles.subtitle}>Захиалгаа баталгаажуулахын тулд доорх дансруу шилжүүлэлт хийнэ үү.</p>

        {/* Booking Summary */}
        <div className={styles.summary}>
          <h3 className={styles.sectionLabel}>Захиалгын мэдээлэл</h3>
          <div className={styles.row}><span>Захиалгын дугаар</span><strong>{booking.bookingId}</strong></div>
          <div className={styles.row}><span>Багц / Аялал</span><strong>{booking.serviceName}</strong></div>
          <div className={styles.row}><span>Амралтын огноо</span><strong>{travelDate}</strong></div>
          {booking.bookingTime && <div className={styles.row}><span>Цаг</span><strong>{booking.bookingTime}</strong></div>}
          <div className={styles.row}><span>Хүний тоо</span><strong>{booking.numberOfPeople}</strong></div>
          {booking.duration && booking.duration !== 'N/A' && (
            <div className={styles.row}><span>Үргэлжлэх хугацаа</span><strong>{booking.duration}</strong></div>
          )}
          {amount > 0 && (
            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>Нийт дүн</span>
              <strong className={styles.amount}>${amount.toLocaleString()}</strong>
            </div>
          )}
        </div>

        {/* Bank Transfer Info */}
        <div className={styles.bankBox}>
          <h3 className={styles.sectionLabel}>💳 Шилжүүлэлтийн мэдээлэл</h3>
          <div className={styles.row}><span>Банк</span><strong>Хаан Банк</strong></div>
          <div className={styles.row}><span>Дансны дугаар</span><strong>5001234567</strong></div>
          <div className={styles.row}><span>Эзэмшигч</span><strong>Total Grand Travel LLC</strong></div>
          <div className={styles.row}><span>Гүйлгээний утга</span><strong>{booking.bookingId}</strong></div>
          {amount > 0 && (
            <div className={styles.row}><span>Шилжүүлэх дүн</span><strong>${amount.toLocaleString()}</strong></div>
          )}
          <p className={styles.bankNote}>
            ⚠️ Гүйлгээний утга дотор захиалгын дугаарыг ({booking.bookingId}) заавал бичнэ үү.
          </p>
        </div>

        {/* Payment Confirmation Form */}
        <form className={styles.form} onSubmit={handlePay}>
          <h3 className={styles.sectionLabel}>Төлбөр баталгаажуулах</h3>

          <label className={styles.label}>
            Имэйл хаяг <span className={styles.required}>*</span>
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="Захиалгадаа бүртгэсэн имэйл"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            Гүйлгээний лавлах дугаар <span className={styles.optional}>(заавал биш)</span>
            <input
              className={styles.input}
              type="text"
              name="transactionId"
              placeholder="Банкны гүйлгээний дугаар"
              value={form.transactionId}
              onChange={handleChange}
            />
          </label>

          <label className={styles.label}>
            Төлбөрийн хэлбэр
            <select className={styles.input} name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
              <option value="bank_transfer">Банкны шилжүүлэлт</option>
              <option value="cash">Бэлэн мөнгө</option>
              <option value="card">Карт</option>
              <option value="other">Бусад</option>
            </select>
          </label>

          {payError && <p className={styles.payError}>{payError}</p>}

          <button type="submit" className={styles.payBtn} disabled={submitting}>
            {submitting ? 'Баталгаажуулж байна...' : '✅ Төлбөр баталгаажуулах'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
