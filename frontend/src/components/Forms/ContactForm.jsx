import React, { useState } from 'react';
import { contactService } from '../../services/api';
import styles from './ContactForm.module.css';

const ContactForm = () => {
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [msg, setMsg]       = useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await contactService.send(form);
      setStatus('success');
      setMsg('Message sent! We will get back to you within 24 hours.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
      setMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {status === 'success' && (
        <div className="alert alert-success"><i className="fas fa-check-circle" />{msg}</div>
      )}
      {status === 'error' && (
        <div className="alert alert-error"><i className="fas fa-exclamation-circle" />{msg}</div>
      )}

      <div className={styles.row}>
        <div className="form-group">
          <label>Your Name</label>
          <input className="form-input" type="text" value={form.name} onChange={set('name')} placeholder="John Doe" required />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
        </div>
      </div>

      <div className="form-group">
        <label>Subject</label>
        <input className="form-input" type="text" value={form.subject} onChange={set('subject')} placeholder="How can we help?" required />
      </div>

      <div className="form-group">
        <label>Message</label>
        <textarea className="form-input" rows={5} value={form.message} onChange={set('message')} placeholder="Tell us about your dream trip..." required />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={status === 'loading'}>
        {status === 'loading'
          ? <><span className="spinner" /> Sending...</>
          : <><i className="fas fa-paper-plane" /> Send Message</>}
      </button>
    </form>
  );
};

export default ContactForm;
