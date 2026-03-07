import React, { useState, useEffect } from 'react';
import { contactService, contentService } from '../services/api';
import { useLanguage } from '../hooks/useContext';
import styles from './Contact.module.css';

// ============================================================
// 📌 CONTACT INFO — ЭНД ӨӨРЧИЛНӨ ӨӨ
// ============================================================
const CONTACT_INFO = {
  emails:  ['grandtravelmongolia@gmail.com'],
  phone:   '+976 77088055',
  hours:   'Everyday 24/7',
  address: 'Chingeltei district, 20th khoroo, Khuvisgalchid Street, Sky Hotel building room 105, Ulaanbaatar city, Mongolia',
};

const SOCIAL_LINKS = [
  { icon: 'fab fa-facebook-f',  label: 'Facebook',  color: '#1877f2', href: 'https://www.facebook.com/profile.php?id=100068557103724 ' },
  //{ icon: 'fab fa-instagram',   label: 'Instagram', color: '#e1306c', href: 'https://instagram.com/itravelz' },
  // { icon: 'fab fa-twitter',     label: 'Twitter',   color: '#1da1f2', href: 'https://twitter.com/itravelz' },
  // { icon: 'fab fa-youtube',     label: 'YouTube',   color: '#ff0000', href: 'https://youtube.com/@itravelz' },
  // { icon: 'fab fa-tiktok',      label: 'TikTok',    color: '#010101', href: 'https://tiktok.com/@itravelz' },
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
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [msg,    setMsg]    = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [heroContent, setHeroContent] = useState(null);

  useEffect(() => {
    contentService.getAll({ section: 'contact_hero' })
      .then((res) => {
        const today = new Date(); today.setHours(0,0,0,0);
        const heroes = res.data?.content || res.data || [];
        const active = heroes.filter((h) => {
          if (!h.isActive) return false;
          if (!h.validFrom) return true;
          return new Date(h.validFrom) <= today;
        });
        if (active.length > 0) setHeroContent(active[0]);
      })
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMsg('');
    try {
      await contactService.send(form);
      setStatus('success');
      setMsg('Thank you! We\'ll get back to you within 24 hours.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Failed to send. Please try again or email us directly.');
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div
        className={styles.hero}
        style={heroContent?.imageUrl || heroContent?.image ? {
          backgroundImage: `url(${heroContent.imageUrl || heroContent.image})`,
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

      {/* Contact grid */}
      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            {/* Contact form */}
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>{t('contact_send')}</h2>
              <p className={styles.formSub}>{t('page_contact_sub')}</p>

              {status === 'success' && (
                <div className="alert alert-success" style={{marginBottom:'20px'}}>
                  <i className="fas fa-check-circle" /> {msg}
                </div>
              )}
              {status === 'error' && (
                <div className="alert alert-error" style={{marginBottom:'20px'}}>
                  <i className="fas fa-exclamation-circle" /> {msg}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.row}>
                  <div className="form-group">
                    <label>{t('contact_name')} *</label>
                    <input className="form-input" type="text" value={form.name} onChange={set('name')} placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label>{t('contact_email')} *</label>
                    <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className="form-group">
                    <label>{t('contact_phone')}</label>
                    <input className="form-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="form-group">
                    <label>{t('contact_subject')} *</label>
                    <select className="form-input" value={form.subject} onChange={set('subject')} required>
                      <option value="">Select a subject</option>
                      <option>Tour Package Inquiry</option>
                      <option>Custom Itinerary Request</option>
                      <option>Booking Support</option>
                      <option>Partnership Inquiry</option>
                      <option>General Question</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('contact_message')} *</label>
                  <textarea
                    className="form-input"
                    rows={5}
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Tell us about your dream trip or how we can help..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={status === 'loading'}
                  style={{width:'100%'}}
                >
                  {status === 'loading'
                    ? <><span className="spinner" /> {t('contact_sending')}</>
                    : <><i className="fas fa-paper-plane" /> {t('contact_send')}</>}
                </button>
              </form>
            </div>

            {/* Contact info */}
            <div className={styles.infoPanel}>
              {/* Quick info cards */}
              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon} style={{'--ic':'#4f75ff'}}>
                    <i className="fas fa-envelope" />
                  </div>
                  <div>
                    <h4>Email Us</h4>
                    {CONTACT_INFO.emails.map((em) => (
                      <a key={em} href={`mailto:${em}`}>{em}</a>
                    ))}
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon} style={{'--ic':'#ff9f43'}}>
                    <i className="fas fa-clock" />
                  </div>
                  <div>
                    <h4>Business Hours</h4>
                    <span>{CONTACT_INFO.hours}</span>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className={styles.socialBox}>
                <h4>Follow Our Adventures</h4>
                <div className={styles.socials}>
                  {SOCIAL_LINKS.map(({ icon, label, color, href }) => (
                    <a key={label} href={href} className={styles.social} style={{'--sc': color}}
                       aria-label={label} target="_blank" rel="noopener noreferrer">
                      <i className={icon} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`${styles.faqSection} section`}>
        <div className="container">
          <div className={styles.faqHead}>
            <span className="section-label">FAQs</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className={styles.faqs}>
            {FAQS.map(({q, a}, i) => (
              <div key={i} className={`${styles.faq} ${openFaq === i ? styles.faqOpen : ''}`}>
                <button className={styles.faqQ} onClick={() => setOpenFaq(o => o === i ? null : i)}>
                  <span>{q}</span>
                  <i className={`fas fa-chevron-${openFaq === i ? 'up' : 'down'}`} />
                </button>
                {openFaq === i && <div className={styles.faqA}>{a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
