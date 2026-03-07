const Package     = require('../models/Package');
const Itinerary   = require('../models/Itinerary');
const Destination = require('../models/Destination');
const Service     = require('../models/Service');

// ─────────────────────────────────────────────
// Optional: OpenAI (only if OPENAI_API_KEY set)
// ─────────────────────────────────────────────
let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const { OpenAI } = require('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (_) { /* openai not installed */ }
}

// ─────────────────────────────────────────────
// Intent detection (Mongolian + English)
// ─────────────────────────────────────────────
const INTENTS = {
  greeting: [
    'сайн уу', 'сайн байна уу', 'hello', 'hi', 'hey', 'сайн', 'нүмбэн', 'мэнд',
    'good morning', 'good afternoon', 'good evening',
  ],
  farewell: ['баяртай', 'bye', 'goodbye', 'see you', 'болно', 'дараа уулзая'],
  packages_list: [
    'ямар tours', 'ямар аялал', 'ямар tour', 'аялал байна уу', 'tours байна уу',
    'packages байна', 'tour байдаг', 'аялал харах', 'tour харах', 'бүх аялал',
    'what tours', 'what packages', 'available tours', 'available packages',
    'list of tours', 'show tours', 'show packages', 'all packages', 'all tours',
    'сул аялал', 'сул tour', 'available', 'аялалууд', 'packag', 'tour ', 'аялал',
  ],
  price: [
    'үнэ', 'хэд', 'price', 'cost', 'how much', 'үнэтэй', 'хямд', 'cheap',
    'expensive', 'budget', 'хямдрал', 'хөнгөлөлт', 'discount', 'төгрөг', 'usd', '$',
  ],
  booking: [
    'захиалах', 'захиалга', 'book', 'reserve', 'booking', 'захиалж', 'хэрхэн захиалах',
    'how to book', 'sign up', 'бүртгэх', 'бүртгүүлэх', 'payment', 'pay', 'төлбөр',
  ],
  itinerary: [
    'itinerary', 'хөтөлбөр', 'day by day', 'schedule', 'хуваарь', 'өдрийн',
    'plan', 'program', 'програм', 'day 1', 'day 2',
  ],
  destination: [
    'destination', 'газар', 'байршил', 'where', 'хаана', 'аялах газар', 'travel to',
    'gobi', 'khuvsgul', 'хөвсгөл', 'говь', 'ulaanbaatar', 'улаанбаатар', 'mongolia',
  ],
  contact: [
    'холбогдох', 'contact', 'phone', 'утас', 'email', 'имейл', 'address', 'хаяг',
    'reach', 'call', 'facebook', 'whatsapp', 'social', 'хэрхэн холбогдох',
  ],
  services: [
    'үйлчилгээ', 'service', 'what do you offer', 'санал', 'offer', 'include',
    'guide', 'driver', 'жолооч', 'хөтөч',
  ],
  visa: [
    'visa', 'entry', 'passport', 'permit', 'travel document', 'виз', 'визний',
    'виза', 'яаж орох', 'how to enter', 'entry requirement',
  ],
  weather: [
    'weather', 'temperature', 'climate', 'season', 'цаг агаар', 'уур амьсгал',
    'хүйтэн', 'дулаан', 'хур тунадас', 'cold', 'hot', 'when to visit', 'best time',
    'хэзээ аялах', 'явах вэ', 'сараас',
  ],
  accommodation: [
    'hotel', 'ger', 'camp', 'stay', 'lodge', 'overnight', 'sleep', 'hostel',
    'зочид буудал', 'гэр', 'буудал', 'хонох', 'хаана хонох', 'camping',
  ],
  transport: [
    'transport', 'bus', 'train', 'flight', 'taxi', 'car', 'drive', 'тээвэр',
    'нисэх', 'автобус', 'get around', 'travel within', 'хэрхэн явах', 'замнал',
  ],
  food: [
    'food', 'eat', 'restaurant', 'хоол', 'cuisine', 'хүнс', 'mongolian food',
    'цуйван', 'хуушуур', 'бууз', 'tsuivan', 'khuushuur', 'buuz', 'айраг',
  ],
  group: [
    'group', 'join', 'group tour', 'public tour', 'бүлэг аялал', 'нийтийн аялал',
    'хэдэн хүн', 'хамтдаа аялах', 'other travelers',
  ],
  help: [
    'help', 'тусалж', 'юу хийн', 'what can', 'how can', 'menu', 'options', 'сонголт',
  ],
};

function detectIntent(msg) {
  const lower = msg.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some((k) => lower.includes(k))) return intent;
  }
  return 'unknown';
}

// Check if msg mentions a specific package/destination name
function findMentionedPackage(msg, packages) {
  const lower = msg.toLowerCase();
  return packages.find((p) =>
    lower.includes(p.name.toLowerCase()) ||
    (p.destination && lower.includes(p.destination.toLowerCase()))
  );
}

// ─────────────────────────────────────────────
// Format helpers
// ─────────────────────────────────────────────
function fmtPackages(pkgs) {
  if (!pkgs.length) return '😔 Одоогоор идэвхтэй аялал байхгүй байна. Удахгүй шинэ аялалууд нэмэгдэнэ!';
  let txt = `🌍 **Одоогийн ${pkgs.length} аялал:**\n\n`;
  pkgs.slice(0, 8).forEach((p, i) => {
    txt += `${i + 1}. **${p.name}**\n`;
    txt += `   📍 ${p.destination || '—'} · ⏱ ${p.duration || '—'} · 💵 $${Number(p.price).toLocaleString()}\n`;
    if (p.category) txt += `   🏷 ${p.category}\n`;
    txt += '\n';
  });
  if (pkgs.length > 8) txt += `_...болон ${pkgs.length - 8} нэмэлт аялал байна._\n`;
  txt += '\n👉 Дэлгэрэнгүй мэдээлэл авах болон захиалга хийхийн тулд **[Packages хуудас](/packages)**-руу очно уу.';
  return txt;
}

function fmtItineraries(itin) {
  if (!itin.length) return '😔 Одоогоор хөтөлбөр байхгүй байна.';
  let txt = `🗺 **Аялалын хөтөлбөрүүд (${itin.length}):**\n\n`;
  itin.slice(0, 6).forEach((it, i) => {
    txt += `${i + 1}. **${it.title}**\n`;
    txt += `   📍 ${it.locations || '—'} · ⏱ ${it.duration || '—'}`;
    if (it.price) txt += ` · 💵 $${Number(it.price).toLocaleString()}`;
    txt += '\n\n';
  });
  txt += '👉 Бүх хөтөлбөрийг харах: **[Itineraries хуудас](/itineraries)**';
  return txt;
}

function fmtDestinations(dests) {
  if (!dests.length) return '😔 Одоогоор тохируулсан газар байхгүй.';
  let txt = `✈️ **Аялах боломжтой газрууд (${dests.length}):**\n\n`;
  dests.slice(0, 8).forEach((d, i) => {
    txt += `${i + 1}. **${d.name}** — ${[d.city, d.country].filter(Boolean).join(', ') || '—'}`;
    if (d.category) txt += ` (${d.category})`;
    txt += '\n';
  });
  if (dests.length > 8) txt += `_...болон ${dests.length - 8} нэмэлт газар._\n`;
  txt += '\n👉 **[Destinations хуудас](/destinations)**';
  return txt;
}

function fmtServices(svcs) {
  if (!svcs.length) return '😔 Одоогоор үйлчилгээний жагсаалт байхгүй.';
  let txt = `🛎 **Манай үйлчилгээнүүд:**\n\n`;
  svcs.slice(0, 6).forEach((s, i) => {
    txt += `${i + 1}. **${s.name || s.title}**`;
    if (s.price) txt += ` — $${Number(s.price).toLocaleString()}`;
    txt += '\n';
    if (s.description) txt += `   _${s.description.slice(0, 80)}${s.description.length > 80 ? '…' : ''}_\n`;
    txt += '\n';
  });
  txt += '👉 **[Services хуудас](/services)**';
  return txt;
}

// ─────────────────────────────────────────────
// Main chat handler
// ─────────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const { message, history = [], language = 'en' } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ reply: 'Та асуулт бичнэ үү.' });
    }

    // Load DB data once per request
    const [packages, itineraries, destinations, services] = await Promise.all([
      Package.find({ status: 'active' }).sort({ createdAt: -1 }).limit(50).lean(),
      Itinerary.find({ isActive: true }).sort({ order: 1 }).limit(30).lean(),
      Destination.find({ isActive: true }).sort({ name: 1 }).limit(50).lean(),
      Service.find().limit(20).lean(),
    ]);

    // ── OpenAI path ──────────────────────────────────────────
    if (openai) {
      const systemPrompt = buildSystemPrompt(packages, itineraries, destinations, services, language);
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: message },
      ];
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 600,
        temperature: 0.7,
      });
      const reply = completion.choices[0].message.content;
      return res.json({ reply });
    }

    // ── Keyword-based path ───────────────────────────────────
    const intent = detectIntent(message);
    const mentioned = findMentionedPackage(message, packages);

    let reply = '';

    // If user mentions a specific package by name
    if (mentioned) {
      reply = `📦 **${mentioned.name}**\n\n`;
      reply += `📍 Байршил: ${mentioned.destination || '—'}\n`;
      reply += `⏱ Хугацаа: ${mentioned.duration || '—'}\n`;
      reply += `💵 Үнэ: $${Number(mentioned.price).toLocaleString()} / хүн\n`;
      reply += `🏷 Ангилал: ${mentioned.category || '—'}\n`;
      if (mentioned.description) reply += `\n📝 ${mentioned.description.slice(0, 150)}${mentioned.description.length > 150 ? '…' : ''}\n`;
      if ((mentioned.features || []).length) {
        reply += `\n✅ Багтсан үйлчилгээнүүд:\n`;
        mentioned.features.slice(0, 5).forEach((f) => { reply += `  • ${f}\n`; });
      }
      reply += `\n👉 Захиалга хийх: **[Энд дарна уу](/booking?package=${mentioned._id})**`;
      return res.json({ reply });
    }

    switch (intent) {
      case 'greeting':
        reply = `👋 Сайн байна уу! ITravelz-д тавтай морил!\n\nБи таны аялалын туслах бот байна. Дараах зүйлсийн талаар асууж болно:\n\n• 🌍 **Аялалууд** — ямар tour байна?\n• 💵 **Үнэ** — аялалын зардал\n• 🗺 **Хөтөлбөрүүд** — itinerary\n• ✈️ **Газрууд** — хаана аялах\n• 📞 **Холбогдох** — бидэнтэй уулзах\n\nЮу асуух вэ? 😊`;
        break;

      case 'farewell':
        reply = `👋 Баяртай! Сайхан аялаарай! ✈️\n\nАсуулт байгаа бол дахин холбогдоорой.`;
        break;

      case 'packages_list':
        reply = fmtPackages(packages);
        break;

      case 'price': {
        const lower = message.toLowerCase();
        // Try to find price of specific package
        const priceMatch = packages.find((p) =>
          lower.includes(p.name.toLowerCase()) ||
          (p.destination && lower.includes(p.destination.toLowerCase()))
        );
        if (priceMatch) {
          reply = `💵 **${priceMatch.name}** — $${Number(priceMatch.price).toLocaleString()} / хүн\n📍 ${priceMatch.destination} · ⏱ ${priceMatch.duration}`;
        } else if (packages.length) {
          const sorted = [...packages].sort((a, b) => a.price - b.price);
          const min = sorted[0].price;
          const max = sorted[sorted.length - 1].price;
          reply = `💵 **Аялалын үнийн мэдээлэл:**\n\n• Хамгийн хямд: **$${Number(min).toLocaleString()}** (${sorted[0].name})\n• Хамгийн үнэтэй: **$${Number(max).toLocaleString()}** (${sorted[sorted.length - 1].name})\n\nБүх аялалын үнийг харах: **[Packages хуудас](/packages)**\n\n_Тодорхой аялалын үнийг асуухдаа нэрийг дурдаарай._`;
        } else {
          reply = '💵 Одоогоор аялалын мэдээлэл байхгүй байна.';
        }
        break;
      }

      case 'booking':
        reply = `📋 **Захиалга хийх заавар:**\n\n1. **[Packages](/packages)** хуудас руу очно уу\n2. Таалагдсан аялалаа сонгоно\n3. **"Book Now"** товч дарна\n4. Мэдээллэе бөглөнө\n5. Баталгаажуулалт хүлээнэ\n\n👉 **[Одоо захиалах](/packages)**\n\n❓ Тодорхой аялалын захиалгын талаар асуухдаа нэрийг дурдаарай.`;
        break;

      case 'itinerary':
        reply = fmtItineraries(itineraries);
        break;

      case 'destination':
        reply = fmtDestinations(destinations);
        break;

      case 'contact':
        reply = `📞 **Contact iTravel Mongolia:**\n\n• 📧 **Email:** grandtravelmongolia@gmail.com\n• 📱 **Phone / WhatsApp:** +976 77088055\n• 📘 **Facebook:** [iTravel Mongolia](https://www.facebook.com/profile.php?id=100068557103724)\n• 🕐 **Hours:** Everyday 24/7\n\n👉 Or use our **[Contact page](/contact)** to send a message.`;
        break;

      case 'services':
        reply = fmtServices(services);
        break;

      case 'visa':
        reply = `🛂 **Mongolia Visa Information:**\n\nCitizens of many countries can visit Mongolia **visa-free for up to 30 days**.\n\n✅ **Visa-free countries include:** USA, EU, UK, Japan, South Korea, and 60+ others.\n\n❌ **Visa required:** Some nationalities require a tourist visa — apply at a Mongolian embassy or online via evisa.mn.\n\n📋 **Required documents:** Valid passport (6+ months), return ticket, accommodation confirmation.\n\n👉 **[See our tours](/packages)** — we can assist with visa invitation letters for group bookings.\n\n_Always verify with the official Mongolian embassy for your country._`;
        break;

      case 'weather':
        reply = `🌤 **Mongolia Weather & Best Travel Time:**\n\n**☀️ Summer (Jun–Sep):** Best time to visit! Warm days 20–30°C, ideal for Gobi and steppe tours.\n**🍂 Autumn (Sep–Oct):** Cool weather, beautiful landscapes, fewer crowds.\n**❄️ Winter (Nov–Mar):** Very cold (-20 to -40°C) but unique experiences like the Eagle Festival.\n**🌸 Spring (Apr–May):** Warming up, good for off-season travel.\n\n💡 **Most popular:** July–August — Naadam Festival (July 11–13) is a must-see!\n\n👉 **[See available tours](/packages)**`;
        break;

      case 'accommodation':
        reply = `🏕 **Accommodation in Mongolia:**\n\n**🏡 Ger Camps (Tourist Gers):** Traditional portable homes set up in beautiful nature — most popular for tours. Comfortable beds, meals included.\n**🏨 Hotels (Ulaanbaatar):** Wide range from budget guesthouses to 5-star hotels.\n**⛺ Camping:** Available on private/custom tours in remote areas.\n\nAll our **[tour packages](/packages)** include accommodation (ger camps or hotels depending on the itinerary).\n\n👉 Want details on a specific tour's accommodation? **[Browse packages](/packages)**`;
        break;

      case 'transport':
        reply = `🚌 **Getting Around Mongolia:**\n\n**✈️ International flights:** Chinggis Khaan International Airport (ULN), Ulaanbaatar — connections from Seoul, Beijing, Moscow, Istanbul.\n**🚐 Tour vehicles:** All our tours include 4WD Russian Furgon vans perfect for off-road Mongolia travel.\n**🚂 Trans-Mongolian Railway:** Runs Ulaanbaatar–Beijing and Ulaanbaatar–Moscow.\n**🚌 Local buses:** Budget option between major cities.\n\nAll **[our packages](/packages)** include ground transportation throughout the tour.`;
        break;

      case 'food':
        reply = `🍖 **Mongolian Food & Cuisine:**\n\n**🥟 Buuz:** Steamed dumplings with minced meat — Mongolia's most beloved dish.\n**🥟 Khuushuur:** Deep-fried meat pastries, especially popular during Naadam.\n**🍜 Tsuivan:** Noodles stir-fried with meat and vegetables.\n**🥛 Airag:** Fermented mare's milk — a traditional drink you must try!\n**🍲 Khorkhog:** Lamb cooked with hot stones inside a container — a true nomadic feast.\n\nMost **ger camp tour packages** include traditional Mongolian meals throughout the journey.\n\n👉 **[Browse food-inclusive tours](/packages)**`;
        break;

      case 'group':
        reply = `👥 **Group Tours in Mongolia:**\n\n**Small group tours (2–12 people):** We specialize in small, personalized groups for a better experience.\n**Private tours:** Available for any group size — fully customized itinerary.\n**Solo travelers:** Can join scheduled group departures at lower cost.\n\n📅 **Fixed departure dates** available June–September for Gobi, Central Mongolia, and Khuvsgul tours.\n\n👉 **[View all group tours](/packages)** or **[contact us](/contact)** to build a custom group tour.`;
        break;

      case 'help':
        reply = `🤖 **I can help you with:**\n\n• 🌍 Browse Mongolia tours & packages\n• 💵 Check pricing & budgets\n• ✈️ Explore destinations (Gobi, Khuvsgul, etc.)\n• 🗺 View tour itineraries\n• 🛂 Visa & entry requirements\n• 🌤 Weather & best travel times\n• 🏕 Accommodation (ger camps, hotels)\n• 🚐 Transport & getting around\n• 🍖 Mongolian food & culture\n• 📋 How to book\n• 📞 Contact our team\n\n_Just ask in English or Mongolian!_`;
        break;

      default: {
        const lower2 = message.toLowerCase();
        const pkgHints = packages.filter((p) =>
          lower2.includes(p.destination?.toLowerCase() || '') ||
          lower2.includes(p.category?.toLowerCase() || '') ||
          lower2.includes(p.name?.toLowerCase() || '')
        );
        if (pkgHints.length) {
          reply = `🔍 **Matching tours:**\n\n`;
          pkgHints.slice(0, 4).forEach((p, i) => {
            reply += `${i + 1}. **${p.name}** — $${Number(p.price).toLocaleString()} · ${p.destination || '—'}\n`;
          });
          reply += `\n👉 **[View all tours](/packages)**`;
        } else {
          const fallback = {
            mn: '🤔 Уучлаарай, тодорхой хариулт өгч чадахгүй байна.\n\n• _"Ямар tour байна вэ?"_\n• _"Үнэ хэд вэ?"_\n• _"Захиалга хийх"_\n\n👉 **[Бүх аялал](/packages)** · **[Холбогдох](/contact)**',
            de: '🤔 Entschuldigung, das konnte ich nicht beantworten.\n\n• _"Welche Touren gibt es?"_\n• _"Wie viel kostet eine Tour?"_\n\n👉 **[Alle Touren](/packages)** · **[Kontakt](/contact)**',
            ko: '🤔 잘 이해하지 못했습니다.\n\n• _"어떤 투어가 있나요?"_\n• _"가격은 얼마인가요?"_\n\n👉 **[전체 투어](/packages)** · **[연락하기](/contact)**',
            ja: '🤔 申し訳ありませんが、理解できませんでした。\n\n• _"どんなツアーがありますか？"_\n• _"料金はいくらですか？"_\n\n👉 **[全ツアー](/packages)** · **[お問い合わせ](/contact)**',
            zh: '🤔 抱歉，我不太理解您的问题。\n\n• _"有哪些行程？"_\n• _"费用是多少？"_\n\n👉 **[全部行程](/packages)** · **[联系我们](/contact)**',
          };
          reply = fallback[language] || `🤔 I'm not sure about that.\n\n• _"What tours are available?"_\n• _"How much do tours cost?"_\n• _"How do I book?"_\n\n👉 **[Browse tours](/packages)** · **[Contact us](/contact)**`;
        }
      }
    }

    res.json({ reply });
  } catch (error) {
    console.error('[CHAT ERROR]', error);
    res.status(500).json({ reply: '😔 Түр зуур алдаа гарлаа. Дахин оролдоно уу.' });
  }
};

// ─────────────────────────────────────────────
// OpenAI system prompt builder
// ─────────────────────────────────────────────
function buildSystemPrompt(packages, itineraries, destinations, services, language = 'en') {
  const LANG = { en: 'English', mn: 'Mongolian', de: 'German', ko: 'Korean', ja: 'Japanese', zh: 'Chinese' };
  const langName = LANG[language] || 'English';
  let prompt = `You are iTravel Mongolia's friendly AI travel assistant.
IMPORTANT: Always respond in ${langName} only, regardless of what language the user writes in.
Be helpful, concise, and enthusiastic about Mongolia travel. Use emojis appropriately.

AVAILABLE PACKAGES (${packages.length} total, live from database):
${packages.slice(0, 15).map((p) =>
  `- ${p.name}: $${p.price}/person, ${p.duration}, ${p.destination}, category: ${p.category}`
).join('\n')}

AVAILABLE DESTINATIONS (${destinations.length} total):
${destinations.slice(0, 15).map((d) =>
  `- ${d.name}: ${[d.city, d.country].filter(Boolean).join(', ')} (${d.category})`
).join('\n')}

ITINERARIES (${itineraries.length} total):
${itineraries.slice(0, 10).map((it) =>
  `- ${it.title}: ${it.duration}, ${it.locations}${it.price ? `, $${it.price}` : ''}`
).join('\n')}

When recommending packages, include price and booking link: [Book ${'{name}'}](/booking?package=${'{id}'}).
For listings: /packages, /itineraries, /destinations.
Keep responses under 250 words.`;
  return prompt;
}
