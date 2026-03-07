import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatService, packageService } from '../../services/api';
import { useLanguage } from '../../hooks/useContext';
import styles from './ChatWidget.module.css';

// ── Per-language flow translations ───────────────────────────
const FLOW_T = {
  en: {
    welcome:         "Hello 👋 Welcome to iTravel Mongolia! Are you planning a trip to Mongolia?",
    yes_trip:        "Yes, planning a trip ✈️",
    just_info:       "Just looking for information",
    contact_expert:  "Contact travel expert",
    tour_interest:   "Great! What type of tour are you interested in?",
    custom_tour:     "Custom Private Tour 🎯",
    travel_date:     "When are you planning to travel?",
    jun_jul:         "June – July",
    aug_sep:         "August – September",
    flexible:        "Flexible dates",
    not_sure:        "Not sure yet",
    group_size:      "How many people will travel?",
    solo:            "Solo traveler",
    two:             "2 travelers",
    three_five:      "3–5 travelers",
    six_plus:        "6+ travelers",
    tour_style:      "What type of tour style do you prefer?",
    budget:          "Budget tour 💰",
    standard:        "Standard tour ⭐",
    luxury:          "Luxury tour 👑",
    recommend_msg:   "Based on your preferences:\n✈️ **Tour**: {tourType}\n📅 **Date**: {travelDate}\n👥 **Group**: {groupSize}\n⭐ **Style**: {tourStyle}\n\nHere's our top recommendation for you!",
    no_pkg_match:    "Here are our most popular tours that match your preferences!",
    book_this:       "Book This Tour 🎯",
    browse_all:      "Browse All Tours",
    ask_question:    "Ask a Question 💬",
    back_tours:      "← Choose different tour",
    faq_msg:         "Feel free to ask any question about Mongolia travel, tours, or prices. I'm here to help! 😊",
    contact_msg:     "Our travel experts are ready to help you plan your perfect Mongolia trip!\n\n📞 **[Contact us here](/contact)** — we respond within 24 hours.",
    type_placeholder:"Ask a question…",
  },
  mn: {
    welcome:         "Сайн уу 👋 iTravel Mongolia-д тавтай морил! Та Монгол руу аялахаар төлөвлөж байна уу?",
    yes_trip:        "Тийм, аялал төлөвлөж байна ✈️",
    just_info:       "Зөвхөн мэдээлэл авмаар байна",
    contact_expert:  "Аяллын мэргэжилтэнтэй холбогдох",
    tour_interest:   "Гайхалтай! Ямар аялалыг сонирхож байна вэ?",
    custom_tour:     "Хувийн тусгай аялал 🎯",
    travel_date:     "Та хэзээ аялахаар төлөвлөж байна вэ?",
    jun_jul:         "6–7-р сар",
    aug_sep:         "8–9-р сар",
    flexible:        "Огноо уян хатан",
    not_sure:        "Одоогоор мэдэхгүй",
    group_size:      "Хэдэн хүн аялах вэ?",
    solo:            "Ганцаар",
    two:             "2 хүн",
    three_five:      "3–5 хүн",
    six_plus:        "6+ хүн",
    tour_style:      "Ямар хэв маягийн аяллыг илүүд үздэг вэ?",
    budget:          "Хэмнэлттэй аялал 💰",
    standard:        "Стандарт аялал ⭐",
    luxury:          "Тансаг аялал 👑",
    recommend_msg:   "Таны сонголтууд:\n✈️ **Аялал**: {tourType}\n📅 **Огноо**: {travelDate}\n👥 **Хүн**: {groupSize}\n⭐ **Хэв маяг**: {tourStyle}\n\nТаны хувьд хамгийн тохиромжтой аялал:",
    no_pkg_match:    "Таны сонголтод тохирсон хамгийн алдартай аялалуудыг харуулж байна!",
    book_this:       "Энэ аяллыг захиалах 🎯",
    browse_all:      "Бүх аялалыг үзэх",
    ask_question:    "Асуулт асуух 💬",
    back_tours:      "← Өөр аялал сонгох",
    faq_msg:         "Монгол аялал, tour, үнийн талаар дурын асуулт асуугаарай. Тусалахад бэлэн! 😊",
    contact_msg:     "Манай аяллын мэргэжилтнүүд таны Монгол аяллыг төлөвлөхөд тусалахад бэлэн байна!\n\n📞 **[Холбогдох хуудас](/contact)** — 24 цагийн дотор хариу өгнө.",
    type_placeholder:"Асуулт асуух…",
  },
  de: {
    welcome:         "Hallo 👋 Willkommen bei iTravel Mongolia! Planen Sie eine Reise in die Mongolei?",
    yes_trip:        "Ja, ich plane eine Reise ✈️",
    just_info:       "Nur Informationen suchen",
    contact_expert:  "Reiseexperten kontaktieren",
    tour_interest:   "Toll! Für welche Touren interessieren Sie sich?",
    custom_tour:     "Private Individualtour 🎯",
    travel_date:     "Wann planen Sie zu reisen?",
    jun_jul:         "Juni – Juli",
    aug_sep:         "August – September",
    flexible:        "Flexible Daten",
    not_sure:        "Noch nicht sicher",
    group_size:      "Wie viele Personen reisen?",
    solo:            "Einzelreisender",
    two:             "2 Reisende",
    three_five:      "3–5 Reisende",
    six_plus:        "6+ Reisende",
    tour_style:      "Welchen Tourstil bevorzugen Sie?",
    budget:          "Budget-Tour 💰",
    standard:        "Standard-Tour ⭐",
    luxury:          "Luxus-Tour 👑",
    recommend_msg:   "Basierend auf Ihren Präferenzen:\n✈️ **Tour**: {tourType}\n📅 **Datum**: {travelDate}\n👥 **Gruppe**: {groupSize}\n⭐ **Stil**: {tourStyle}\n\nUnsere Top-Empfehlung für Sie!",
    no_pkg_match:    "Hier sind unsere beliebtesten Touren, die zu Ihnen passen!",
    book_this:       "Diese Tour buchen 🎯",
    browse_all:      "Alle Touren ansehen",
    ask_question:    "Frage stellen 💬",
    back_tours:      "← Andere Tour wählen",
    faq_msg:         "Stellen Sie gerne Fragen zu Mongolei-Reisen, Touren oder Preisen. Ich helfe Ihnen! 😊",
    contact_msg:     "Unsere Experten helfen Ihnen gerne!\n\n📞 **[Kontakt hier](/contact)** — Antwort innerhalb von 24 Stunden.",
    type_placeholder:"Frage stellen…",
  },
  ko: {
    welcome:         "안녕하세요 👋 iTravel Mongolia에 오신 것을 환영합니다! 몽골 여행을 계획 중이신가요?",
    yes_trip:        "네, 여행을 계획 중입니다 ✈️",
    just_info:       "정보만 찾고 있습니다",
    contact_expert:  "여행 전문가에게 연락",
    tour_interest:   "훌륭합니다! 어떤 투어에 관심이 있으신가요?",
    custom_tour:     "맞춤 프라이빗 투어 🎯",
    travel_date:     "언제 여행할 예정인가요?",
    jun_jul:         "6월 – 7월",
    aug_sep:         "8월 – 9월",
    flexible:        "날짜 유연",
    not_sure:        "아직 모름",
    group_size:      "몇 명이 여행하나요?",
    solo:            "혼자 여행",
    two:             "2명",
    three_five:      "3–5명",
    six_plus:        "6명 이상",
    tour_style:      "어떤 투어 스타일을 선호하시나요?",
    budget:          "알뜰 투어 💰",
    standard:        "스탠다드 투어 ⭐",
    luxury:          "럭셔리 투어 👑",
    recommend_msg:   "선호도:\n✈️ **투어**: {tourType}\n📅 **날짜**: {travelDate}\n👥 **그룹**: {groupSize}\n⭐ **스타일**: {tourStyle}\n\n최고 추천 투어입니다!",
    no_pkg_match:    "선호도에 맞는 인기 투어를 소개합니다!",
    book_this:       "이 투어 예약하기 🎯",
    browse_all:      "모든 투어 보기",
    ask_question:    "질문하기 💬",
    back_tours:      "← 다른 투어 선택",
    faq_msg:         "몽골 여행, 투어, 가격에 대해 자유롭게 질문하세요. 도와드리겠습니다! 😊",
    contact_msg:     "저희 전문가들이 완벽한 여행을 준비해 드립니다!\n\n📞 **[여기서 연락하기](/contact)** — 24시간 내 응답.",
    type_placeholder:"질문을 입력하세요…",
  },
  ja: {
    welcome:         "こんにちは 👋 iTravel Mongoliaへようこそ！モンゴル旅行をご計画中ですか？",
    yes_trip:        "はい、旅行を計画しています ✈️",
    just_info:       "情報を探しています",
    contact_expert:  "旅行専門家に連絡",
    tour_interest:   "素晴らしい！どのツアーに興味がありますか？",
    custom_tour:     "プライベートカスタムツアー 🎯",
    travel_date:     "いつ旅行を計画していますか？",
    jun_jul:         "6月 – 7月",
    aug_sep:         "8月 – 9月",
    flexible:        "日程は柔軟",
    not_sure:        "まだ未定",
    group_size:      "何名で旅行しますか？",
    solo:            "一人旅",
    two:             "2名",
    three_five:      "3〜5名",
    six_plus:        "6名以上",
    tour_style:      "ツアースタイルは？",
    budget:          "バジェットツアー 💰",
    standard:        "スタンダードツアー ⭐",
    luxury:          "ラグジュアリーツアー 👑",
    recommend_msg:   "ご希望:\n✈️ **ツアー**: {tourType}\n📅 **日程**: {travelDate}\n👥 **人数**: {groupSize}\n⭐ **スタイル**: {tourStyle}\n\nおすすめツアーをご紹介します！",
    no_pkg_match:    "人気のツアーをご紹介します！",
    book_this:       "このツアーを予約 🎯",
    browse_all:      "全ツアーを見る",
    ask_question:    "質問する 💬",
    back_tours:      "← 別のツアーを選ぶ",
    faq_msg:         "モンゴル旅行について何でもご質問ください。お手伝いします！ 😊",
    contact_msg:     "専門家がお手伝いします！\n\n📞 **[お問い合わせはこちら](/contact)** — 24時間以内にご返信。",
    type_placeholder:"質問を入力…",
  },
  zh: {
    welcome:         "您好 👋 欢迎来到iTravel Mongolia！您在计划去蒙古的旅行吗？",
    yes_trip:        "是的，我在计划旅行 ✈️",
    just_info:       "只是寻找信息",
    contact_expert:  "联系旅行专家",
    tour_interest:   "太好了！您对哪种旅游感兴趣？",
    custom_tour:     "私人定制游 🎯",
    travel_date:     "您计划什么时候旅行？",
    jun_jul:         "6月 – 7月",
    aug_sep:         "8月 – 9月",
    flexible:        "日期灵活",
    not_sure:        "还不确定",
    group_size:      "几人出行？",
    solo:            "独自旅行",
    two:             "2人",
    three_five:      "3–5人",
    six_plus:        "6人以上",
    tour_style:      "您偏好哪种旅游风格？",
    budget:          "经济游 💰",
    standard:        "标准游 ⭐",
    luxury:          "豪华游 👑",
    recommend_msg:   "您的偏好:\n✈️ **行程**: {tourType}\n📅 **日期**: {travelDate}\n👥 **人数**: {groupSize}\n⭐ **风格**: {tourStyle}\n\n这是我们为您推荐的最佳行程！",
    no_pkg_match:    "这是符合您偏好的热门行程！",
    book_this:       "预订此行程 🎯",
    browse_all:      "浏览全部行程",
    ask_question:    "提问 💬",
    back_tours:      "← 选择其他行程",
    faq_msg:         "欢迎随时提问关于蒙古旅行的任何问题。我来帮您！ 😊",
    contact_msg:     "我们的专家随时准备为您服务！\n\n📞 **[点击联系我们](/contact)** — 24小时内回复。",
    type_placeholder:"输入问题…",
  },
};

// ── Markdown renderer ────────────────────────────────────────
const renderText = (text) =>
  text.split('\n').map((line, li, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**'))
        return <strong key={i}>{p.slice(2, -2)}</strong>;
      const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
      const chunks = [];
      let last = 0, m;
      while ((m = linkRe.exec(p)) !== null) {
        if (m.index > last) chunks.push(p.slice(last, m.index));
        chunks.push(
          <a key={m.index} href={m[2]} className={styles.chatLink}
            onClick={e => { if (!m[2].startsWith('http')) { e.preventDefault(); window.location.href = m[2]; } }}>
            {m[1]}
          </a>
        );
        last = m.index + m[0].length;
      }
      if (last < p.length) chunks.push(p.slice(last));
      return chunks.length ? chunks : p;
    });
    return <span key={li}>{parts}{li < arr.length - 1 && <br />}</span>;
  });

const TypingDots = () => (
  <div className={styles.typingWrap}>
    <div className={styles.botAvatar}><i className="fas fa-robot" /></div>
    <div className={styles.typingBubble}>
      <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
    </div>
  </div>
);

// ── ChatWidget ───────────────────────────────────────────────
const ChatWidget = () => {
  const { language } = useLanguage();
  const navigate     = useNavigate();

  // Translation helper
  const lt = useCallback((key) => FLOW_T[language]?.[key] ?? FLOW_T.en[key] ?? key, [language]);
  const lformat = useCallback((key, vars = {}) => {
    let s = lt(key);
    Object.entries(vars).forEach(([k, v]) => { s = s.replaceAll(`{${k}}`, v); });
    return s;
  }, [lt]);

  const [open,      setOpen]      = useState(false);
  const [flowStep,  setFlowStep]  = useState('welcome');
  const [flowData,  setFlowData]  = useState({ tourType: '', travelDate: '', groupSize: '', tourStyle: '' });
  const [packages,  setPackages]  = useState([]);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [typing,    setTyping]    = useState(false);
  const [unread,    setUnread]    = useState(0);
  const bodyRef  = useRef(null);
  const inputRef = useRef(null);

  // Load active packages from DB once
  useEffect(() => {
    packageService.getAll()
      .then(res => {
        const raw = res.data?.packages ?? res.data ?? [];
        setPackages(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {});
  }, []);

  // Set welcome message (re-set when language changes)
  useEffect(() => {
    setMessages([{ role: 'assistant', content: lt('welcome') }]);
  }, [lt]);

  // Auto-scroll
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  // Unread badge
  useEffect(() => {
    if (!open) setUnread(n => n + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // ── Tour interest: live packages from DB ──────────────────
  const getTourInterestOptions = useCallback(() => {
    const base = packages.slice(0, 4).map(p => ({ label: p.name, next: 'travel_date', pkgId: p._id }));
    return [...base, { label: lt('custom_tour'), next: 'travel_date' }].slice(0, 5);
  }, [packages, lt]);

  // ── Recommend: find best matching package ─────────────────
  const getRecommendedPackage = useCallback(() => {
    if (!packages.length) return null;
    const lower = flowData.tourType.toLowerCase();
    let match = packages.find(p =>
      p.name?.toLowerCase().includes(lower) ||
      lower.includes((p.name ?? '').toLowerCase()) ||
      p.destination?.toLowerCase().includes(lower) ||
      lower.includes((p.destination ?? '').toLowerCase())
    );
    if (!match) {
      const sorted = [...packages].sort((a, b) => a.price - b.price);
      if (flowData.tourStyle.includes('Budget') || flowData.tourStyle.includes('💰') || flowData.tourStyle.includes('경제') || flowData.tourStyle.includes('经济') || flowData.tourStyle.includes('ハジェット') || flowData.tourStyle.includes('Хэмнэлттэй') || flowData.tourStyle.includes('Budget'))
        match = sorted[0];
      else if (flowData.tourStyle.includes('Luxury') || flowData.tourStyle.includes('👑') || flowData.tourStyle.includes('Тансаг') || flowData.tourStyle.includes('럭셔리') || flowData.tourStyle.includes('豪华') || flowData.tourStyle.includes('ラグジュアリー'))
        match = sorted[sorted.length - 1];
      else
        match = sorted[Math.floor(sorted.length / 2)] ?? sorted[0];
    }
    return match ?? null;
  }, [packages, flowData]);

  // ── Current flow step buttons ─────────────────────────────
  const getCurrentOptions = useCallback(() => {
    switch (flowStep) {
      case 'welcome':
        return [
          { label: lt('yes_trip'),       next: 'tour_interest' },
          { label: lt('just_info'),      next: 'faq' },
          { label: lt('contact_expert'), next: 'contact_info' },
        ];
      case 'tour_interest':
        return getTourInterestOptions();
      case 'travel_date':
        return [
          { label: lt('jun_jul'),  next: 'group_size' },
          { label: lt('aug_sep'),  next: 'group_size' },
          { label: lt('flexible'), next: 'group_size' },
          { label: lt('not_sure'), next: 'group_size' },
        ];
      case 'group_size':
        return [
          { label: lt('solo'),       next: 'tour_style' },
          { label: lt('two'),        next: 'tour_style' },
          { label: lt('three_five'), next: 'tour_style' },
          { label: lt('six_plus'),   next: 'tour_style' },
        ];
      case 'tour_style':
        return [
          { label: lt('budget'),   next: 'recommend' },
          { label: lt('standard'), next: 'recommend' },
          { label: lt('luxury'),   next: 'recommend' },
        ];
      case 'recommend': {
        const pkg = getRecommendedPackage();
        return [
          ...(pkg ? [{ label: lt('book_this'),   next: '_book',       pkgId: pkg._id }] : []),
          { label: lt('browse_all'),   next: '_browse' },
          { label: lt('back_tours'),   next: 'tour_interest' },
          { label: lt('ask_question'), next: 'faq' },
        ];
      }
      default:
        return [];
    }
  }, [flowStep, lt, getTourInterestOptions, getRecommendedPackage]);

  // ── Handle flow button click ──────────────────────────────
  const handleFlowOption = useCallback((option) => {
    const next      = option.next;
    const userLabel = option.label;
    const newData   = { ...flowData };

    if (flowStep === 'tour_interest') newData.tourType   = userLabel;
    if (flowStep === 'travel_date')   newData.travelDate = userLabel;
    if (flowStep === 'group_size')    newData.groupSize  = userLabel;
    if (flowStep === 'tour_style')    newData.tourStyle  = userLabel;
    if (next === 'tour_interest')     newData.tourType   = '';
    setFlowData(newData);

    const userMsg = { role: 'user', content: userLabel };

    // Navigate actions (no step change needed)
    if (next === '_book' && option.pkgId) {
      navigate(`/booking?package=${option.pkgId}`);
      return;
    }
    if (next === '_browse') {
      navigate('/packages');
      return;
    }

    // FAQ (free chat)
    if (next === 'faq') {
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: lt('faq_msg') }]);
      setFlowStep('faq');
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    // Contact info
    if (next === 'contact_info') {
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: lt('contact_msg') }]);
      setFlowStep('faq');
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    // Recommend step
    if (next === 'recommend') {
      const summary = lformat('recommend_msg', {
        tourType:   newData.tourType,
        travelDate: newData.travelDate,
        groupSize:  newData.groupSize,
        tourStyle:  newData.tourStyle,
      });
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: summary }]);
      setFlowStep('recommend');
      return;
    }

    // Tour interest (back)
    if (next === 'tour_interest') {
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: lt('tour_interest') }]);
      setFlowStep('tour_interest');
      return;
    }

    // Normal flow steps
    const stepMessages = {
      tour_interest: lt('tour_interest'),
      travel_date:   lt('travel_date'),
      group_size:    lt('group_size'),
      tour_style:    lt('tour_style'),
    };
    if (stepMessages[next]) {
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: stepMessages[next] }]);
      setFlowStep(next);
    }
  }, [flowStep, flowData, lt, lformat, navigate]);

  // ── Free-text chat message ────────────────────────────────
  const sendChatMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setTyping(true);
    try {
      const history = messages.slice(-6);
      const res = await chatService.send(msg, history, language);
      const reply = res.data?.reply || '😔 No response. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '😔 Connection error. Please try again.' }]);
    } finally {
      setTyping(false);
    }
  }, [input, messages, language]);

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } };

  // ── Derived state ──────────────────────────────────────────
  const currentOptions    = getCurrentOptions();
  const showFlowButtons   = currentOptions.length > 0;
  const recommendedPkg    = flowStep === 'recommend' ? getRecommendedPackage() : null;

  return (
    <>
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

            {/* Recommended package card */}
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
          </div>

          {/* Flow buttons */}
          {showFlowButtons && (
            <div className={styles.flowOptions}>
              {currentOptions.map((opt, i) => (
                <button key={i} className={styles.flowBtn} onClick={() => handleFlowOption(opt)}>
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
              placeholder={lt('type_placeholder')}
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
        </div>
      )}

      {/* FAB */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={open ? () => setOpen(false) : () => { setOpen(true); setUnread(0); }}
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
