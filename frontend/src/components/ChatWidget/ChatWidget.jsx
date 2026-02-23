import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/api';
import styles from './ChatWidget.module.css';

// ── Simple markdown-like renderer ───────────────────────────────
const renderText = (text) => {
  const lines = text.split('\n');
  return lines.map((line, li) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={i}>{p.slice(2, -2)}</strong>;
      }
      // Inline link: [label](url)
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

const QUICK_REPLIES = [
  'Ямар аялал байна вэ?',
  'Үнэ хэд вэ?',
  'Захиалга хэрхэн хийх?',
  'Ямар газар аялдаг вэ?',
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
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Сайн байна уу! ITravelz-ийн туслах бот байна.\n\nАялалын талаар ямар асуулт байна вэ? 😊',
    },
  ]);
  const [input,    setInput]   = useState('');
  const [typing,   setTyping]  = useState(false);
  const [unread,   setUnread]  = useState(0);
  const bodyRef  = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // Unread badge
  useEffect(() => {
    if (!open) setUnread((n) => n + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const openChat = () => { setOpen(true); setUnread(0); setTimeout(() => inputRef.current?.focus(), 100); };

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const history = messages.slice(-6);
      const res = await chatService.send(msg, history);
      const reply = res.data?.reply || '😔 Хариулт авсангүй. Дахин оролдоно уу.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: '😔 Холболтын алдаа гарлаа. Дахин оролдоно уу.' }]);
    } finally {
      setTyping(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

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
                <div className={styles.headerName}>ITravelz Assistant</div>
                <div className={styles.headerStatus}><span className={styles.onlineDot} /> Online</div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              <i className="fas fa-times" />
            </button>
          </div>

          {/* Messages */}
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
          </div>

          {/* Quick replies — show after first bot message only */}
          {messages.length <= 2 && !typing && (
            <div className={styles.quickReplies}>
              {QUICK_REPLIES.map((q) => (
                <button key={q} className={styles.quickBtn} onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder="Асуулт бичнэ үү..."
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
            />
            <button
              className={styles.sendBtn}
              onClick={() => send()}
              disabled={!input.trim() || typing}
              aria-label="Send"
            >
              <i className="fas fa-paper-plane" />
            </button>
          </div>
        </div>
      )}

      {/* ── FAB Button ── */}
      <button className={`${styles.fab} ${open ? styles.fabOpen : ''}`} onClick={open ? () => setOpen(false) : openChat} aria-label="Open chat">
        {open
          ? <i className="fas fa-times" />
          : <i className="fas fa-comment-dots" />}
        {!open && unread > 1 && <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>}
      </button>
    </>
  );
};

export default ChatWidget;
