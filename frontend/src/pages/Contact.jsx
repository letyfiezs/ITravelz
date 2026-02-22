import React, { useState } from 'react';
import { contactService } from '../services/api';
import styles from './Contact.module.css';

const OFFICES = [
  { city: 'New York', address: '350 5th Avenue, Suite 4100', phone: '+1 (212) 555-0100', hours: 'Mon–Fri 9AM–6PM EST' },
  { city: 'London',   address: '10 Upper Bank Street, Canary Wharf', phone: '+44 20 7946 0958', hours: 'Mon–Fri 9AM–6PM GMT' },
  { city: 'Dubai',    address: 'Burj Khalifa District, Tower 1', phone: '+971 4 555 0100', hours: 'Mon–Fri 9AM–6PM GST' },
];

const FAQS = [
  { q: 'How far in advance should I book?', a: 'We recommend booking at least 4–6 weeks before your travel date for the best availability and pricing.' },
  { q: 'Do you offer travel insurance?', a: 'Yes, all our packages include basic travel insurance. Comprehensive coverage can be added during booking.' },
  { q: 'Can I customize a package?', a: 'Absolutely! Every package can be tailored to your preferences, budget, and schedule. Contact us to get started.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, bank transfers, and installment plans for bookings over $1,000.' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [msg,    setMsg]    = useState('');
  const [openFaq, setOpenFaq] = useState(null);

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
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <span className="section-label">Get In Touch</span>
          <h1 className={styles.heroTitle}>Contact Us</h1>
          <p className={styles.heroSub}>Have a question or ready to plan your dream trip? We'd love to hear from you.</p>
        </div>
      </div>

      {/* Contact grid */}
      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            {/* Contact form */}
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Send Us a Message</h2>
              <p className={styles.formSub}>Fill in the form and our team will respond within 24 hours.</p>

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
                    <label>Full Name *</label>
                    <input className="form-input" type="text" value={form.name} onChange={set('name')} placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input className="form-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="form-group">
                    <label>Subject *</label>
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
                  <label>Message *</label>
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
                    ? <><span className="spinner" /> Sending...</>
                    : <><i className="fas fa-paper-plane" /> Send Message</>}
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
                    <a href="mailto:hello@itravelz.com">hello@itravelz.com</a>
                    <a href="mailto:support@itravelz.com">support@itravelz.com</a>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon} style={{'--ic':'#28c76f'}}>
                    <i className="fas fa-phone-alt" />
                  </div>
                  <div>
                    <h4>Call Us</h4>
                    <a href="tel:+12125550100">+1 (212) 555-0100</a>
                    <span>Mon–Fri, 9AM – 6PM</span>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon} style={{'--ic':'#ff9f43'}}>
                    <i className="fas fa-comments" />
                  </div>
                  <div>
                    <h4>Live Chat</h4>
                    <span>Available 24/7</span>
                    <span>Avg. response: 5 min</span>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon} style={{'--ic':'#ea5455'}}>
                    <i className="fas fa-map-marker-alt" />
                  </div>
                  <div>
                    <h4>Visit Us</h4>
                    <span>350 5th Ave, New York</span>
                    <span>Suite 4100, NY 10118</span>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className={styles.socialBox}>
                <h4>Follow Our Adventures</h4>
                <div className={styles.socials}>
                  {[
                    {icon:'fab fa-facebook-f', label:'Facebook', color:'#1877f2'},
                    {icon:'fab fa-instagram',  label:'Instagram', color:'#e1306c'},
                    {icon:'fab fa-twitter',    label:'Twitter',   color:'#1da1f2'},
                    {icon:'fab fa-youtube',    label:'YouTube',   color:'#ff0000'},
                    {icon:'fab fa-tiktok',     label:'TikTok',    color:'#000'},
                  ].map(({icon, label, color}) => (
                    <a key={label} href="#" className={styles.social} style={{'--sc': color}} aria-label={label} rel="noreferrer">
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
