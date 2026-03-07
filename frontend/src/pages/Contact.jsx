import React, { useState, useEffect } from 'react';
import { contactService, contentService } from '../services/api';
import { useLanguage } from '../hooks/useContext';
import styles from './Contact.module.css';

const BASE = (import.meta?.env?.VITE_API_URL || '').replace('/api', '');

// ============================================================
// 📌 CONTACT INFO — ЭНД ӨӨРЧИЛНӨ ӨӨ
// ============================================================
const CONTACT_INFO = {
  emails:  ['grandtravelmongolia@gmail.com'],
  phone:   '+976 77088055',
  hours:   'Everyday 24/7',
  address: 'Chingeltei district, 20th khoroo, Khuvisgalchid Street, Sky Hotel building room 105, Ulaanbaatar city, Mongolia',
  mapsUrl: 'https://maps.google.com/?q=Chingeltei+district+Sky+Hotel+Ulaanbaatar+Mongolia',
};

const SOCIAL_LINKS = [
  { icon: 'fab fa-facebook-f', label: 'Facebook', color: '#1877f2', href: 'https://www.facebook.com/profile.php?id=100068557103724' },
  // { icon: 'fab fa-instagram', label: 'Instagram', color: '#e1306c', href: '' },
];
// ============================================================

const FAQS = [
  { q: 'How far in advance should I book?', a: 'We recommend booking at least 4–6 weeks before your travel date for the best availability and pricing.' },
  { q: 'Do you offer travel insurance?', a: 'Yes, all our packages include basic travel insurance. Comprehensive coverage can be added during booking.' },
  { q: 'Can I customize a package?', a: 'Absolutely! Every package can be tailored to your preferences, budget, and schedule. Contact us to get started.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, bank transfers, and installment plans for bookings over $1,000.' },
];

const Contact = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [msg,    setMsg]    = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [heroContent, setHeroContent] = useState(null);

  useEffect(() => {
    contentService.getAll({ section: 'contact_hero' })
      .then((res) => {
        const heroes = res.data?.content || res.data || [];
        const active = heroes.filter((h) => h.isActive);
        if (active.length > 0) setHeroContent(active[0]);
      })
      .catch(() => {});
  }, []);

  const heroImgRaw = heroContent?.imageUrl || heroContent?.image;
  const heroImg = heroImgRaw
    ? (heroImgRaw.startsWith('http') ? heroImgRaw : `${BASE}${heroImgRaw}`)
    : null;

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMsg('');
    try {
      await contactService.send(form);
      setStatus('success');
      setMsg("Thank you! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Failed to send. Please try again or email us directly.');
    }
  };

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <div
        className={styles.hero}
        style={heroImg ? {
          backgroundImage: `url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <span className="section-label">
            {heroContent?.eyebrow || t('page_contact')}
          </span>
          <h1 className={styles.heroTitle}>
            {heroContent?.title || t('page_contact')}
          </h1>
          <p className={styles.heroSub}>
            {heroContent?.subtitle || heroContent?.text || t('page_contact_sub')}
          </p>
        </div>
      </div>

      {/* ── Main grid ── */}
      <section className="section">
        <div className="container">
          <div className={styles.grid}>

            {/* Contact form */}
            <div className={styles.formCard}>
              <div className={styles.formHeaderRow}>
                <div className={styles.formHeaderIcon}>
                  <i className="fas fa-paper-plane" />
                </div>
                <div>
                  <h2 className={styles.formTitle}>{t('contact_send')}</h2>
                  <p className={styles.formSub}>{t('page_contact_sub')}</p>
                </div>
              </div>

              {status === 'success' && (
                <div className={`${styles.alert} ${styles.alertSuccess}`}>
                  <i className="fas fa-check-circle" /> {msg}
                </div>
              )}
              {status === 'error' && (
                <div className={`${styles.alert} ${styles.alertError}`}>
                  <i className="fas fa-exclamation-circle" /> {msg}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.row}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>{t('contact_name')} <span>*</span></label>
                    <div className={styles.inputWrap}>
                      <i className="fas fa-user" />
                      <input className={styles.input} type="text" value={form.name} onChange={set('name')} placeholder="John Doe" required />
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>{t('contact_email')} <span>*</span></label>
                    <div className={styles.inputWrap}>
                      <i className="fas fa-envelope" />
                      <input className={styles.input} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>{t('contact_phone')}</label>
                    <div className={styles.inputWrap}>
                      <i className="fas fa-phone" />
                      <input className={styles.input} type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>{t('contact_subject')} <span>*</span></label>
                    <div className={styles.inputWrap}>
                      <i className="fas fa-tag" />
                      <select className={`${styles.input} ${styles.select}`} value={form.subject} onChange={set('subject')} required>
                        <option value="">Select a subject</option>
                        <option>Tour Package Inquiry</option>
                        <option>Custom Itinerary Request</option>
                        <option>Booking Support</option>
                        <option>Partnership Inquiry</option>
                        <option>General Question</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>{t('contact_message')} <span>*</span></label>
                  <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    rows={5}
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Tell us about your dream trip or how we can help…"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={status === 'loading'}
                >
                  {status === 'loading'
                    ? <><span className={styles.spinner} /> Sending…</>
                    : <><i className="fas fa-paper-plane" /> {t('contact_send')}</>}
                </button>
              </form>
            </div>

            {/* Info panel */}
            <div className={styles.infoPanel}>

              <div className={styles.infoStack}>
                {/* Email */}
                <a href={`mailto:${CONTACT_INFO.emails[0]}`} className={styles.infoRow}>
                  <div className={styles.infoIcon} style={{'--ic':'#4f75ff'}}>
                    <i className="fas fa-envelope" />
                  </div>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Email Us</span>
                    <span className={styles.infoValue}>{CONTACT_INFO.emails[0]}</span>
                  </div>
                  <i className={`fas fa-chevron-right ${styles.infoArrow}`} />
                </a>

                {/* Phone */}
                <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g,'')}`} className={styles.infoRow}>
                  <div className={styles.infoIcon} style={{'--ic':'#28c76f'}}>
                    <i className="fas fa-phone-alt" />
                  </div>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Call Us</span>
                    <span className={styles.infoValue}>{CONTACT_INFO.phone}</span>
                  </div>
                  <i className={`fas fa-chevron-right ${styles.infoArrow}`} />
                </a>

                {/* Hours */}
                <div className={styles.infoRow} style={{cursor:'default'}}>
                  <div className={styles.infoIcon} style={{'--ic':'#ff9f43'}}>
                    <i className="fas fa-clock" />
                  </div>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Business Hours</span>
                    <span className={styles.infoValue}>{CONTACT_INFO.hours}</span>
                  </div>
                </div>

                {/* Address */}
                <a href={CONTACT_INFO.mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.infoRow}>
                  <div className={styles.infoIcon} style={{'--ic':'#ea5455'}}>
                    <i className="fas fa-map-marker-alt" />
                  </div>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Visit Us</span>
                    <span className={styles.infoValue}>{CONTACT_INFO.address}</span>
                  </div>
                  <i className={`fas fa-external-link-alt ${styles.infoArrow}`} />
                </a>
              </div>

              {/* Social */}
              {SOCIAL_LINKS.length > 0 && (
                <div className={styles.socialCard}>
                  <p className={styles.socialTitle}>Follow Our Adventures</p>
                  <div className={styles.socialList}>
                    {SOCIAL_LINKS.map(({ icon, label, color, href }) => (
                      <a
                        key={label}
                        href={href}
                        className={styles.socialBtn}
                        style={{'--sc': color}}
                        aria-label={label}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className={icon} />
                        <span>{label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ── Map ── */}
      <section className={styles.mapSection}>
        <div className="container">
          <div className={styles.mapHeader}>
            <span className="section-label">Our Location</span>
            <h2 className="section-title">Find Us in Ulaanbaatar</h2>
          </div>
          <div className={styles.mapWrap}>
            <iframe
              title="iTravel Mongolia Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.0!2d106.9178!3d47.9184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d96924e9b659745%3A0x71a6d7bc47d95ed5!2sChingeltei%20District%2C%20Ulaanbaatar%2C%20Mongolia!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
              className={styles.mapFrame}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={CONTACT_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapOverlay}
            >
              <i className="fas fa-directions" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={`${styles.faqSection} section`}>
        <div className="container">
          <div className={styles.faqHead}>
            <span className="section-label">FAQs</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className={styles.faqs}>
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className={`${styles.faq} ${openFaq === i ? styles.faqOpen : ''}`}>
                <button
                  className={styles.faqQ}
                  onClick={() => setOpenFaq(o => o === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{q}</span>
                  <i className="fas fa-chevron-down" />
                </button>
                <div className={styles.faqBody}>
                  <div className={styles.faqA}>{a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
