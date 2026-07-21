import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatService, packageService } from '../../services/api';
import { useLanguage } from '../../hooks/useContext';
import styles from './ChatWidget.module.css';

// ── Company contact info (mirrors Contact.jsx) ────────────────
const CONTACT = {
  email:    'sales@itravelmongolia.com',
  phone:    '+976 77088055',
  facebook: 'https://www.facebook.com/profile.php?id=100068557103724',
  hours:    'Everyday 24/7',
};

// ── Flow translations (6 languages) ──────────────────────────
const L = {
  en: {
    welcome:       'Hello 👋 Welcome to Itravelmongolia! Are you planning a trip to Mongolia?',
    opt_yes:       'Yes, planning a trip ✈️',
    opt_info:      'Just looking for information',
    opt_contact:   'Contact travel expert',
    tour_q:        'Great! What type of tour are you interested in?',
    custom_tour:   'Custom Private Tour 🎯',
    date_q:        'When are you planning to travel?',
    d1: 'June – July',   d2: 'August – September',
    d3: 'Flexible dates', d4: 'Not sure yet',
    size_q:        'How many people will travel?',
    s1: 'Solo traveler',  s2: '2 travelers',
    s3: '3–5 travelers',  s4: '6+ travelers',
    style_q:       'What tour style do you prefer?',
    st1: 'Budget tour 💰', st2: 'Standard tour ⭐', st3: 'Luxury tour 👑',
    rec_msg:       'Based on your preferences:\n✈️ Tour: {tour}\n📅 Date: {date}\n👥 Group: {size}\n⭐ Style: {style}\n\nHere is our top recommendation:',
    no_pkg:        'Here are our most popular Mongolia tours:',
    btn_book:      'Book This Tour 🎯',
    btn_all:       'Browse All Tours',
    btn_back:      '← Choose Different Tour',
    btn_ask:       'Ask a Question 💬',
    faq_msg:       "Feel free to ask anything about Mongolia travel, tours, prices, or itineraries. I'm here to help! 😊",
    contact_intro: "Here's how to reach our travel experts:",
    placeholder:   'Ask a question…',
    lang_reset:    'Language changed. Starting fresh!',
  },
  mn: {
    welcome:       'Сайн уу 👋 Itravelmongolia-д тавтай морил! Та Монгол руу аялахаар төлөвлөж байна уу?',
    opt_yes:       'Тийм, аялал төлөвлөж байна ✈️',
    opt_info:      'Зөвхөн мэдээлэл авмаар байна',
    opt_contact:   'Аяллын мэргэжилтэнтэй холбогдох',
    tour_q:        'Гайхалтай! Ямар аялалыг сонирхож байна вэ?',
    custom_tour:   'Хувийн тусгай аялал 🎯',
    date_q:        'Та хэзээ аялахаар төлөвлөж байна вэ?',
    d1: '6–7-р сар',          d2: '8–9-р сар',
    d3: 'Огноо уян хатан',    d4: 'Одоогоор мэдэхгүй',
    size_q:        'Хэдэн хүн аялах вэ?',
    s1: 'Ганцаар',    s2: '2 хүн',
    s3: '3–5 хүн',    s4: '6+ хүн',
    style_q:       'Ямар хэв маягийн аяллыг илүүд үздэг вэ?',
    st1: 'Хэмнэлттэй аялал 💰', st2: 'Стандарт аялал ⭐', st3: 'Тансаг аялал 👑',
    rec_msg:       'Таны сонголтууд:\n✈️ Аялал: {tour}\n📅 Огноо: {date}\n👥 Хүн: {size}\n⭐ Хэв маяг: {style}\n\nТаны хувьд хамгийн тохиромжтой аялал:',
    no_pkg:        'Манай хамгийн алдартай аялалуудыг танилцуулъя:',
    btn_book:      'Энэ аяллыг захиалах 🎯',
    btn_all:       'Бүх аялалыг үзэх',
    btn_back:      '← Өөр аялал сонгох',
    btn_ask:       'Асуулт асуух 💬',
    faq_msg:       'Монгол аялал, tour, үнэ, хөтөлбөрийн талаар дурын асуулт асуугаарай. Тусалахад бэлэн! 😊',
    contact_intro: 'Манай аяллын мэргэжилтэдтэй холбогдох мэдээлэл:',
    placeholder:   'Асуулт бичнэ үү…',
    lang_reset:    'Хэл солигдлоо. Шинэчлэн эхэллээ!',
  },
  de: {
    welcome:       'Hallo 👋 Willkommen bei Itravelmongolia! Planen Sie eine Reise in die Mongolei?',
    opt_yes:       'Ja, ich plane eine Reise ✈️',
    opt_info:      'Nur Informationen suchen',
    opt_contact:   'Reiseexperten kontaktieren',
    tour_q:        'Toll! Für welche Tour interessieren Sie sich?',
    custom_tour:   'Private Individualtour 🎯',
    date_q:        'Wann planen Sie zu reisen?',
    d1: 'Juni – Juli',        d2: 'August – September',
    d3: 'Flexible Daten',     d4: 'Noch nicht sicher',
    size_q:        'Wie viele Personen reisen?',
    s1: 'Einzelreisender',    s2: '2 Reisende',
    s3: '3–5 Reisende',       s4: '6+ Reisende',
    style_q:       'Welchen Tourstil bevorzugen Sie?',
    st1: 'Budget-Tour 💰', st2: 'Standard-Tour ⭐', st3: 'Luxus-Tour 👑',
    rec_msg:       'Ihre Präferenzen:\n✈️ Tour: {tour}\n📅 Datum: {date}\n👥 Gruppe: {size}\n⭐ Stil: {style}\n\nUnsere Top-Empfehlung:',
    no_pkg:        'Hier sind unsere beliebtesten Touren:',
    btn_book:      'Diese Tour buchen 🎯',
    btn_all:       'Alle Touren ansehen',
    btn_back:      '← Andere Tour wählen',
    btn_ask:       'Frage stellen 💬',
    faq_msg:       'Stellen Sie gerne Fragen zu Mongolei-Reisen, Touren oder Preisen. Ich helfe Ihnen! 😊',
    contact_intro: 'So erreichen Sie unsere Reiseexperten:',
    placeholder:   'Frage stellen…',
    lang_reset:    'Sprache geändert. Neustart!',
  },
  ko: {
    welcome:       '안녕하세요 👋 Itravelmongolia에 오신 것을 환영합니다! 몽골 여행을 계획 중이신가요?',
    opt_yes:       '네, 여행을 계획 중입니다 ✈️',
    opt_info:      '정보만 찾고 있습니다',
    opt_contact:   '여행 전문가에게 연락',
    tour_q:        '훌륭합니다! 어떤 투어에 관심이 있으신가요?',
    custom_tour:   '맞춤 프라이빗 투어 🎯',
    date_q:        '언제 여행할 예정인가요?',
    d1: '6월 – 7월',   d2: '8월 – 9월',
    d3: '날짜 유연',    d4: '아직 모름',
    size_q:        '몇 명이 여행하나요?',
    s1: '혼자 여행',   s2: '2명',
    s3: '3–5명',      s4: '6명 이상',
    style_q:       '어떤 투어 스타일을 선호하시나요?',
    st1: '알뜰 투어 💰', st2: '스탠다드 투어 ⭐', st3: '럭셔리 투어 👑',
    rec_msg:       '선호도:\n✈️ 투어: {tour}\n📅 날짜: {date}\n👥 그룹: {size}\n⭐ 스타일: {style}\n\n최고 추천 투어:',
    no_pkg:        '인기 몽골 투어를 소개합니다:',
    btn_book:      '이 투어 예약하기 🎯',
    btn_all:       '모든 투어 보기',
    btn_back:      '← 다른 투어 선택',
    btn_ask:       '질문하기 💬',
    faq_msg:       '몽골 여행, 투어, 가격에 대해 자유롭게 질문하세요. 도와드리겠습니다! 😊',
    contact_intro: '여행 전문가 연락처:',
    placeholder:   '질문을 입력하세요…',
    lang_reset:    '언어가 변경되었습니다. 처음부터 시작합니다!',
  },
  ja: {
    welcome:       'こんにちは 👋 Itravelmongoliaへようこそ！モンゴル旅行をご計画中ですか？',
    opt_yes:       'はい、旅行を計画しています ✈️',
    opt_info:      '情報を探しています',
    opt_contact:   '旅行専門家に連絡',
    tour_q:        '素晴らしい！どのツアーに興味がありますか？',
    custom_tour:   'プライベートカスタムツアー 🎯',
    date_q:        'いつ旅行を計画していますか？',
    d1: '6月 – 7月',      d2: '8月 – 9月',
    d3: '日程は柔軟',      d4: 'まだ未定',
    size_q:        '何名で旅行しますか？',
    s1: '一人旅',    s2: '2名',
    s3: '3〜5名',    s4: '6名以上',
    style_q:       'ツアースタイルは？',
    st1: 'バジェットツアー 💰', st2: 'スタンダードツアー ⭐', st3: 'ラグジュアリーツアー 👑',
    rec_msg:       'ご希望:\n✈️ ツアー: {tour}\n📅 日程: {date}\n👥 人数: {size}\n⭐ スタイル: {style}\n\nおすすめツアー:',
    no_pkg:        '人気のモンゴルツアーをご紹介します:',
    btn_book:      'このツアーを予約 🎯',
    btn_all:       '全ツアーを見る',
    btn_back:      '← 別のツアーを選ぶ',
    btn_ask:       '質問する 💬',
    faq_msg:       'モンゴル旅行について何でもご質問ください。お手伝いします！ 😊',
    contact_intro: '旅行専門家への連絡先:',
    placeholder:   '質問を入力…',
    lang_reset:    '言語が変更されました。最初からやり直します！',
  },
  zh: {
    welcome:       '您好 👋 欢迎来到Itravelmongolia！您在计划去蒙古的旅行吗？',
    opt_yes:       '是的，我在计划旅行 ✈️',
    opt_info:      '只是寻找信息',
    opt_contact:   '联系旅行专家',
    tour_q:        '太好了！您对哪种旅游感兴趣？',
    custom_tour:   '私人定制游 🎯',
    date_q:        '您计划什么时候旅行？',
    d1: '6月 – 7月',   d2: '8月 – 9月',
    d3: '日期灵活',     d4: '还不确定',
    size_q:        '几人出行？',
    s1: '独自旅行',    s2: '2人',
    s3: '3–5人',      s4: '6人以上',
    style_q:       '您偏好哪种旅游风格？',
    st1: '经济游 💰', st2: '标准游 ⭐', st3: '豪华游 👑',
    rec_msg:       '您的偏好:\n✈️ 行程: {tour}\n📅 日期: {date}\n👥 人数: {size}\n⭐ 风格: {style}\n\n我们的推荐行程:',
    no_pkg:        '这是我们最受欢迎的蒙古行程:',
    btn_book:      '预订此行程 🎯',
    btn_all:       '浏览全部行程',
    btn_back:      '← 选择其他行程',
    btn_ask:       '提问 💬',
    faq_msg:       '欢迎随时提问关于蒙古旅行的任何问题。我来帮您！ 😊',
    contact_intro: '联系我们的旅行专家:',
    placeholder:   '输入问题…',
    lang_reset:    '语言已更改，重新开始！',
  },
};

const t = (lang, key, vars = {}) => {
  let str = (L[lang] || L.en)[key] || (L.en[key] || key);
  Object.entries(vars).forEach(([k, v]) => { str = str.replaceAll(`{${k}}`, v); });
  return str;
};

// ── Markdown renderer: bold, italic, links (incl. bold+link) ──
// Handles: **bold**, _italic_, [label](url), **[label](url)**
function renderInline(text, nav, prefix = '') {
  // Regex matches: **...**, _..._, or [label](url) — in priority order
  const re = /(\*\*[\s\S]+?\*\*|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/g;
  const out = [];
  let last = 0, m, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[1];
    if (tok.startsWith('**')) {
      // Bold — recurse so links inside bold also render
      out.push(<strong key={prefix + k++}>{renderInline(tok.slice(2, -2), nav, prefix + 'b')}</strong>);
    } else if (tok.startsWith('_')) {
      out.push(<em key={prefix + k++} style={{ opacity: 0.85 }}>{tok.slice(1, -1)}</em>);
    } else {
      // Link [label](url)
      const url = m[3], label = m[2];
      const internal = !url.startsWith('http');
      out.push(
        <a key={prefix + k++} href={url} className={styles.chatLink}
          onClick={e => { if (internal) { e.preventDefault(); nav(url); } }}>
          {label}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderText(text, nav) {
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>{renderInline(line, nav)}{i < arr.length - 1 && <br />}</span>
  ));
}

const TypingDots = () => (
  <div className={styles.typingWrap}>
    <div className={styles.botAvatar}><i className="fas fa-robot" /></div>
    <div className={styles.typingBubble}>
      <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
    </div>
  </div>
);

// ── Package card inside chat ──────────────────────────────────
const PkgCard = ({ pkg, onBook, lang }) => (
  <div className={styles.pkgCard}>
    {pkg.image && <img src={pkg.image} alt={pkg.name} className={styles.pkgImg} />}
    <div className={styles.pkgBody}>
      <div className={styles.pkgName}>{pkg.name}</div>
      <div className={styles.pkgMeta}>
        {pkg.destination && <span>📍 {pkg.destination}</span>}
        {pkg.duration    && <span>⏱ {pkg.duration}</span>}
        <span className={styles.pkgPrice}>💵 ${Number(pkg.price).toLocaleString()}</span>
      </div>
    </div>
  </div>
);

// ── Contact info card ─────────────────────────────────────────
const ContactCard = () => (
  <div className={styles.contactCard}>
    <a className={styles.contactRow} href={`mailto:${CONTACT.email}`}>
      <i className="fas fa-envelope" style={{ color: '#6c63ff' }} />
      <span>{CONTACT.email}</span>
    </a>
    <a className={styles.contactRow} href={`tel:${CONTACT.phone}`}>
      <i className="fas fa-phone" style={{ color: '#22c55e' }} />
      <span>{CONTACT.phone}</span>
    </a>
    <a className={styles.contactRow} href={CONTACT.facebook} target="_blank" rel="noopener noreferrer">
      <i className="fab fa-facebook-f" style={{ color: '#1877f2' }} />
      <span>Facebook</span>
    </a>
    <div className={styles.contactRow}>
      <i className="fas fa-clock" style={{ color: '#f59e0b' }} />
      <span>{CONTACT.hours}</span>
    </div>
  </div>
);

// ── ChatWidget ─────────────────────────────────────────────────
const ChatWidget = () => {
  const { language }   = useLanguage();
  const navigate       = useNavigate();

  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [flowStep, setFlowStep] = useState('welcome');
  const [flowData, setFlowData] = useState({ tour: '', date: '', size: '', style: '' });
  const [packages, setPackages] = useState([]);
  const [input,    setInput]    = useState('');
  const [typing,   setTyping]   = useState(false);
  const [unread,   setUnread]   = useState(0);
  const bodyRef  = useRef(null);
  const inputRef = useRef(null);
  // track previous language to detect changes
  const prevLang = useRef(language);

  // ── Load packages from DB once ───────────────────────────
  useEffect(() => {
    packageService.getAll()
      .then(res => {
        const raw = res.data?.packages ?? res.data ?? [];
        setPackages(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {});
  }, []);

  // ── Initialize / reset on language change ────────────────
  useEffect(() => {
    const isLangChange = prevLang.current !== language;
    prevLang.current = language;

    const welcomeMsg = isLangChange
      ? [
          { role: 'assistant', content: t(language, 'lang_reset') },
          { role: 'assistant', content: t(language, 'welcome') },
        ]
      : [{ role: 'assistant', content: t(language, 'welcome') }];

    setMessages(welcomeMsg);
    setFlowStep('welcome');
    setFlowData({ tour: '', date: '', size: '', style: '' });
  }, [language]);

  // ── Auto-scroll ────────────────────────────────────────
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  // ── Unread badge ───────────────────────────────────────
  useEffect(() => {
    if (!open) setUnread(n => n + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // ── Find best matching package ─────────────────────────
  const findPackage = useCallback((tourLabel) => {
    if (!packages.length) return null;
    const lower = tourLabel.toLowerCase();
    let match = packages.find(p =>
      p.name?.toLowerCase().includes(lower) ||
      lower.includes((p.name ?? '').toLowerCase()) ||
      p.destination?.toLowerCase().includes(lower) ||
      lower.includes((p.destination ?? '').toLowerCase())
    );
    if (!match) {
      const sorted = [...packages].sort((a, b) => a.price - b.price);
      match = sorted[Math.floor(sorted.length / 2)] ?? sorted[0];
    }
    return match ?? null;
  }, [packages]);

  // ── Flow: get the current step's option buttons ─────────
  const getOptions = useCallback(() => {
    const lang = language;
    switch (flowStep) {
      case 'welcome':
        return [
          { label: t(lang, 'opt_yes'),     action: 'tour_interest' },
          { label: t(lang, 'opt_info'),    action: 'faq' },
          { label: t(lang, 'opt_contact'), action: 'contact' },
        ];
      case 'tour_interest': {
        const pkgOpts = packages.slice(0, 4).map(p => ({
          label: p.name, action: 'travel_date', data: { tour: p.name },
        }));
        if (!pkgOpts.length) {
          // fallback static options
          return [
            { label: 'Gobi Desert Tour 🏜️',     action: 'travel_date', data: { tour: 'Gobi Desert Tour' } },
            { label: 'Central Mongolia Tour 🏕️', action: 'travel_date', data: { tour: 'Central Mongolia Tour' } },
            { label: 'Lake Khuvsgul Tour 🏔️',    action: 'travel_date', data: { tour: 'Lake Khuvsgul Tour' } },
            { label: t(lang, 'custom_tour'),     action: 'travel_date', data: { tour: t(lang, 'custom_tour') } },
          ];
        }
        return [...pkgOpts, { label: t(lang, 'custom_tour'), action: 'travel_date', data: { tour: t(lang, 'custom_tour') } }].slice(0, 5);
      }
      case 'travel_date':
        return [
          { label: t(lang, 'd1'), action: 'group_size', data: { date: t(lang, 'd1') } },
          { label: t(lang, 'd2'), action: 'group_size', data: { date: t(lang, 'd2') } },
          { label: t(lang, 'd3'), action: 'group_size', data: { date: t(lang, 'd3') } },
          { label: t(lang, 'd4'), action: 'group_size', data: { date: t(lang, 'd4') } },
        ];
      case 'group_size':
        return [
          { label: t(lang, 's1'), action: 'tour_style', data: { size: t(lang, 's1') } },
          { label: t(lang, 's2'), action: 'tour_style', data: { size: t(lang, 's2') } },
          { label: t(lang, 's3'), action: 'tour_style', data: { size: t(lang, 's3') } },
          { label: t(lang, 's4'), action: 'tour_style', data: { size: t(lang, 's4') } },
        ];
      case 'tour_style':
        return [
          { label: t(lang, 'st1'), action: 'recommend', data: { style: t(lang, 'st1') } },
          { label: t(lang, 'st2'), action: 'recommend', data: { style: t(lang, 'st2') } },
          { label: t(lang, 'st3'), action: 'recommend', data: { style: t(lang, 'st3') } },
        ];
      case 'recommend': {
        const pkg = findPackage(flowData.tour);
        return [
          ...(pkg ? [{ label: t(lang, 'btn_book'), action: '_book', data: { pkgId: pkg._id } }] : []),
          { label: t(lang, 'btn_all'),  action: '_browse' },
          { label: t(lang, 'btn_back'), action: 'tour_interest' },
          { label: t(lang, 'btn_ask'),  action: 'faq' },
        ];
      }
      default:
        return [];
    }
  }, [flowStep, language, packages, flowData.tour, findPackage]);

  // ── Handle flow option click ──────────────────────────
  const handleOption = useCallback((opt) => {
    const lang = language;
    const userMsg = { role: 'user', content: opt.label };
    const newData = { ...flowData, ...(opt.data || {}) };
    setFlowData(newData);

    // Special navigation actions
    if (opt.action === '_book' && opt.data?.pkgId) {
      navigate(`/booking?package=${opt.data.pkgId}`);
      return;
    }
    if (opt.action === '_browse') {
      navigate('/packages');
      return;
    }

    // FAQ / free chat mode
    if (opt.action === 'faq') {
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: t(lang, 'faq_msg') }]);
      setFlowStep('faq');
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    // Contact info
    if (opt.action === 'contact') {
      setMessages(prev => [
        ...prev,
        userMsg,
        { role: 'assistant', content: t(lang, 'contact_intro'), extra: 'contact' },
      ]);
      setFlowStep('contact');
      return;
    }

    // Back to tour selection
    if (opt.action === 'tour_interest') {
      setFlowData(d => ({ ...d, tour: '' }));
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: t(lang, 'tour_q') }]);
      setFlowStep('tour_interest');
      return;
    }

    // Recommend step
    if (opt.action === 'recommend') {
      const pkg = findPackage(newData.tour);
      const summary = t(lang, 'rec_msg', {
        tour:  newData.tour,
        date:  newData.date,
        size:  newData.size,
        style: newData.style,
      });
      const botMessages = pkg
        ? [
            { role: 'assistant', content: summary },
            { role: 'assistant', content: pkg.name, extra: 'pkg', pkg },
          ]
        : [{ role: 'assistant', content: t(lang, 'no_pkg') }];
      setMessages(prev => [...prev, userMsg, ...botMessages]);
      setFlowStep('recommend');
      return;
    }

    // Generic flow steps
    const stepMessages = {
      tour_interest: t(lang, 'tour_q'),
      travel_date:   t(lang, 'date_q'),
      group_size:    t(lang, 'size_q'),
      tour_style:    t(lang, 'style_q'),
    };
    if (stepMessages[opt.action]) {
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: stepMessages[opt.action] }]);
      setFlowStep(opt.action);
    }
  }, [language, flowData, findPackage, navigate]);

  // ── Free-text: send to chat API ───────────────────────
  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setTyping(true);
    try {
      const history = messages.slice(-6);
      const res  = await chatService.send(msg, history, language);
      const reply = res.data?.reply || '😔 No response. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '😔 Connection error. Please try again.' }]);
    } finally {
      setTyping(false);
    }
  }, [input, messages, language]);

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const options = getOptions();

  return (
    <>
      {open && (
        <div className={styles.window}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerAvatar}><i className="fas fa-robot" /></div>
              <div>
                <div className={styles.headerName}>Itravelmongolia</div>
                <div className={styles.headerStatus}><span className={styles.onlineDot} /> Travel Assistant</div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
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
                  {m.extra === 'pkg' && m.pkg
                    ? <PkgCard pkg={m.pkg} lang={language} />
                    : m.extra === 'contact'
                    ? <><div>{renderText(m.content, navigate)}</div><ContactCard /></>
                    : renderText(m.content, navigate)
                  }
                </div>
              </div>
            ))}
            {typing && <TypingDots />}
          </div>

          {/* Flow option buttons */}
          {options.length > 0 && (
            <div className={styles.flowOptions}>
              {options.map((opt, i) => (
                <button key={i} className={styles.flowBtn} onClick={() => handleOption(opt)}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Always-visible text input */}
          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder={t(language, 'placeholder')}
              value={input}
              rows={1}
              onChange={e => setInput(e.target.value)}
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

      {/* FAB */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={() => { if (open) { setOpen(false); } else { setOpen(true); setUnread(0); } }}
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
