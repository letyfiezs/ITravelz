import React, { useState, useEffect, useRef } from 'react';
import { chatService, packageService, contactService } from '../../services/api';
import styles from './ChatWidget.module.css';

// ── Simple markdown renderer ─────────────────────────────────
const renderText = (text) => {
  const lines = text.split('\n');
  return lines.map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={i}>{p.slice(2, -2)}</strong>;
      }
      const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
      let lastIdx = 0;
      const chunks = [];
      let m;
      const str = p;
      while ((m = linkRe.exec(str)) !== null) {
        if (m.index > lastIdx) chunks.push(str.slice(lastIdx, m.index));
        chunks.push(
          <a key={m.index} href={m[2]} className={styles.chatLink}
            onClick={(e) => { if (!m[2].startsWith('http')) { e.preventDefault(); window.location.href = m[2]; } }}>
            {m[1]}
          </a>
        );
        lastIdx = m.index + m[0].length;
      }
      if (lastIdx < str.length) chunks.push(str.slice(lastIdx));
      return chunks.length > 0 ? chunks : p;
    });
    return <span key={li}>{parts}{li < lines.length - 1 && <br />}</span>;
  });
};

// ── Booking flow steps ───────────────────────────────────────
const FLOW = {
  welcome: {
    message: "Hello 👋 Welcome to iTravel Mongolia! Are you planning a trip to Mongolia?",
    options: [
      { label: "Yes, planning a trip ✈️", next: 'tour_interest' },
      { label: "Just looking for information", next: 'faq' },
      { label: "Contact travel expert", next: 'contact' },
    ],
  },
  travel_date: {
    message: "When are you planning to travel?",
    options: [
      { label: "June – July", next: 'group_size' },
      { label: "August – September", next: 'group_size' },
      { label: "Flexible dates", next: 'group_size' },
      { label: "Not sure yet", next: 'group_size' },
    ],
  },
  group_size: {
    message: "How many people will travel?",
    options: [
      { label: "Solo traveler", next: 'tour_style' },
      { label: "2 travelers", next: 'tour_style' },
      { label: "3–5 travelers", next: 'tour_style' },
      { label: "6+ travelers", next: 'tour_style' },
    ],
  },
  tour_style: {
    message: "What type of tour style do you prefer?",
    options: [
      { label: "Budget tour 💰", next: 'recommend' },
      { label: "Standard tour ⭐", next: 'recommend' },
      { label: "Luxury tour 👑", next: 'recommend' },
    ],
  },
  recommend: {
    options: [
      { label: "Yes, send itinerary ✉️", next: 'contact' },
      { label: "Show other tours 🔄", next: 'tour_interest' },
    ],
  },
};

// Fallback tour options if no packages in DB
const STATIC_TOUR_OPTIONS = [
  { label: "Gobi Desert Tour 🏜️", next: 'travel_date' },
  { label: "Central Mongolia Tour 🏕️", next: 'travel_date' },
  { label: "Lake Khuvsgul Tour 🏔️", next: 'travel_date' },
  { label: "Custom Private Tour 🎯", next: 'travel_date' },
];

const TypingDots = () => (
  <div className={styles.typingWrap}>
    <div className={styles.botAvatar}><i className="fas fa-robot" /></div>
    <div className={styles.typingBubble}>
      <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
    </div>
  </div>
);

const ChatWidget = () => {
  const [open, setOpen]         = useState(false);
  const [mode, setMode]         = useState('flow'); // 'flow' | 'chat'
  const [flowStep, setFlowStep] = useState('welcome');
  const [flowData, setFlowData] = useState({ tourType: '', travelDate: '', groupSize: '', tourStyle: '' });
  const [packages, setPackages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contactForm, setContactForm]   = useState({ name: '', email: '', whatsapp: '' });
  const [contactSent, setContactSent]   = useState(false);
  const [contactBusy, setContactBusy]   = useState(false);
  const [contactError, setContactError] = useState('');
  const [input,  setInput]  = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bodyRef  = useRef(null);
  const inputRef = useRef(null);

  // Load live packages from DB on mount
  useEffect(() => {
    packageService.getAll({ status: 'active', limit: 10 })
      .then(res => {
        const raw = res.data?.packages ?? res.data ?? [];
        setPackages(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {});
  }, []);

  // Set initial welcome message once
  useEffect(() => {
    setMessages([{ role: 'assistant', content: FLOW.welcome.message }]);
  }, []);

  // Auto-scroll on any body content change
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing, flowStep, contactSent]);

  // Unread badge counter
  useEffect(() => {
    if (!open) setUnread(n => n + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const openChat = () => {
    setOpen(true);
    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Build Tour Interest options from live packages ───────────
  const getTourInterestOptions = () => {
    if (packages.length > 0) {
      const pkgOpts = packages.slice(0, 4).map(p => ({
        label: p.name,
        next: 'travel_date',
      }));
      return [...pkgOpts, { label: "Custom Private Tour 🎯", next: 'travel_date' }].slice(0, 5);
    }
    return STATIC_TOUR_OPTIONS;
  };

  // ── Get buttons for current flow step ───────────────────────
  const getCurrentOptions = () => {
    if (mode !== 'flow') return [];
    if (flowStep === 'tour_interest') return getTourInterestOptions();
    return FLOW[flowStep]?.options ?? [];
  };

  // ── Find best matching package for Recommend step ────────────
  const getRecommendedPackage = () => {
    if (!packages.length) return null;
    const lower = flowData.tourType.toLowerCase();
    let match = packages.find(p =>
      p.name?.toLowerCase().includes(lower) ||
      lower.includes(p.name?.toLowerCase() ?? '') ||
      p.destination?.toLowerCase().includes(lower) ||
      lower.includes(p.destination?.toLowerCase() ?? '')
    );
    if (!match) {
      const sorted = [...packages].sort((a, b) => a.price - b.price);
      if (flowData.tourStyle.includes('Budget'))  match = sorted[0];
      else if (flowData.tourStyle.includes('Luxury')) match = sorted[sorted.length - 1];
      else match = sorted[Math.floor(sorted.length / 2)] ?? sorted[0];
    }
    return match ?? null;
  };

  // ── Handle flow button click ──────────────────────────────────
  const handleFlowOption = (option) => {
    const next = option.next;
    const newFlowData = { ...flowData };

    // Record selection into flowData
    if (flowStep === 'tour_interest') newFlowData.tourType   = option.label;
    if (flowStep === 'travel_date')   newFlowData.travelDate = option.label;
    if (flowStep === 'group_size')    newFlowData.groupSize  = option.label;
    if (flowStep === 'tour_style')    newFlowData.tourStyle  = option.label;
    // Going back to tour selection: reset tour type
    if (next === 'tour_interest')     newFlowData.tourType   = '';

    setFlowData(newFlowData);

    const userMsg = { role: 'user', content: option.label };

    // ── FAQ mode ──────────────────────────────────────────
    if (next === 'faq') {
      const botMsg = "You can ask any question about Mongolia travel, tours, or prices. I'm here to help! 😊\n\nFeel free to ask about packages, pricing, availability, or anything else.";
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: botMsg }]);
      setMode('chat');
      setFlowStep('faq');
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    // ── Contact step ──────────────────────────────────────
    if (next === 'contact') {
      const botMsg = "Please leave your contact details below and our travel specialist will get back to you with a personalized itinerary and price. 📋";
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: botMsg }]);
      setFlowStep('contact');
      return;
    }

    // ── Recommend step ────────────────────────────────────
    if (next === 'recommend') {
      const summary =
        `Based on your preferences:\n` +
        `✈️ **Tour**: ${newFlowData.tourType}\n` +
        `📅 **Date**: ${newFlowData.travelDate}\n` +
        `👥 **Group**: ${newFlowData.groupSize}\n` +
        `⭐ **Style**: ${newFlowData.tourStyle}\n\n` +
        `Here's our top recommendation for you! Would you like us to send the full itinerary and price?`;
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: summary }]);
      setFlowStep('recommend');
      return;
    }

    // ── Tour interest step (also handles going back) ───────
    if (next === 'tour_interest') {
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: "Great! What type of tour are you interested in?" }]);
      setFlowStep('tour_interest');
      return;
    }

    // ── All other steps from FLOW definition ──────────────
    if (FLOW[next]) {
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: FLOW[next].message }]);
      setFlowStep(next);
    }
  };

  // ── Free-text chat (FAQ / post-contact mode) ─────────────────
  const sendChatMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    try {
      const history = messages.slice(-6);
      const res = await chatService.send(msg, history);
      const reply = res.data?.reply || '😔 No response received. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '😔 Connection error. Please try again.' }]);
    } finally {
      setTyping(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } };

  // ── Contact form submit ───────────────────────────────────────
  const submitContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim()) {
      setContactError('Name and Email are required.');
      return;
    }
    setContactBusy(true);
    setContactError('');
    try {
      const msgParts = [
        flowData.tourType   && `Tour Type: ${flowData.tourType}`,
        flowData.travelDate && `Travel Date: ${flowData.travelDate}`,
        flowData.groupSize  && `Group Size: ${flowData.groupSize}`,
        flowData.tourStyle  && `Tour Style: ${flowData.tourStyle}`,
        contactForm.whatsapp && `WhatsApp: ${contactForm.whatsapp}`,
      ].filter(Boolean);

      await contactService.send({
        name:        contactForm.name.trim(),
        email:       contactForm.email.trim(),
        phone:       contactForm.whatsapp.trim(),
        subject:     `Chatbot Inquiry: ${flowData.tourType || 'Travel to Mongolia'}`,
        inquiryType: 'question',
        message:     msgParts.join('\n') || 'Travel to Mongolia inquiry',
      });

      setContactSent(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content:
          `✅ Thank you, **${contactForm.name}**!\n\n` +
          `Our travel specialist will contact you at **${contactForm.email}** shortly with your personalized itinerary and pricing.\n\n` +
          `You can still ask any questions below! 😊`,
      }]);
      setMode('chat');
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch {
      setContactError('Failed to send. Please try again or email us directly.');
    } finally {
      setContactBusy(false);
    }
  };

  // ── Derived UI flags ──────────────────────────────────────────
  const currentOptions  = getCurrentOptions();
  const showFlowButtons = mode === 'flow' && flowStep !== 'contact' && flowStep !== 'faq' && currentOptions.length > 0;
  const showContactForm = mode === 'flow' && flowStep === 'contact' && !contactSent;
  const showInput       = mode === 'chat';
  const recommendedPkg  = flowStep === 'recommend' ? getRecommendedPackage() : null;

  return (
    <>
      {/* ── Chat Window ── */}
      {open && (
        <div className={styles.window}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerAvatar}><i className="fas fa-robot" /></div>
              <div>
                <div className={styles.headerName}>iTravel Mongolia</div>
                <div className={styles.headerStatus}><span className={styles.onlineDot} /> Travel Assistant</div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
              <i className="fas fa-times" />
            </button>
          </div>

          {/* Messages body */}
          <div className={styles.body} ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.row} ${m.role === 'user' ? styles.rowUser : styles.rowBot}`}>
                {m.role === 'assistant' && (
                  <div className={styles.botAvatar}><i className="fas fa-robot" /></div>
                )}
                <div className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleBot}`}>
                  {renderText(m.content)}
                </div>
              </div>
            ))}

            {typing && <TypingDots />}

            {/* Recommended package card (shown inside messages area) */}
            {recommendedPkg && (
              <div className={styles.recommendCard}>
                {recommendedPkg.image && (
                  <img src={recommendedPkg.image} alt={recommendedPkg.name} className={styles.recommendImg} />
                )}
                <div className={styles.recommendInfo}>
                  <div className={styles.recommendName}>{recommendedPkg.name}</div>
                  <div className={styles.recommendMeta}>
                    {recommendedPkg.destination && <span>📍 {recommendedPkg.destination}</span>}
                    {recommendedPkg.duration    && <span>⏱ {recommendedPkg.duration}</span>}
                    <span className={styles.recommendPrice}>
                      💵 ${Number(recommendedPkg.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Inline contact form */}
            {showContactForm && (
              <form className={styles.contactForm} onSubmit={submitContact} noValidate>
                <input
                  className={styles.contactInput}
                  type="text"
                  placeholder="Your Name *"
                  value={contactForm.name}
                  onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  className={styles.contactInput}
                  type="email"
                  placeholder="Email Address *"
                  value={contactForm.email}
                  onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
                <input
                  className={styles.contactInput}
                  type="text"
                  placeholder="WhatsApp Number (optional)"
                  value={contactForm.whatsapp}
                  onChange={e => setContactForm(f => ({ ...f, whatsapp: e.target.value }))}
                />
                {contactError && <div className={styles.contactError}>{contactError}</div>}
                <button className={styles.contactSubmitBtn} type="submit" disabled={contactBusy}>
                  {contactBusy ? 'Sending…' : 'Send My Details ✈️'}
                </button>
              </form>
            )}
          </div>

          {/* ── Flow option buttons ── */}
          {showFlowButtons && (
            <div className={styles.flowOptions}>
              {currentOptions.map((opt, i) => (
                <button key={i} className={styles.flowBtn} onClick={() => handleFlowOption(opt)}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Free-text input (chat/FAQ mode) ── */}
          {showInput && (
            <div className={styles.inputRow}>
              <textarea
                ref={inputRef}
                className={styles.input}
                placeholder="Ask a question…"
                value={input}
                rows={1}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
              />
              <button
                className={styles.sendBtn}
                onClick={() => sendChatMessage()}
                disabled={!input.trim() || typing}
                aria-label="Send"
              >
                <i className="fas fa-paper-plane" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── FAB Button ── */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={open ? () => setOpen(false) : openChat}
        aria-label="Open chat"
      >
        {open ? <i className="fas fa-times" /> : <i className="fas fa-comment-dots" />}
        {!open && unread > 1 && (
          <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>
    </>
  );
};

export default ChatWidget;
