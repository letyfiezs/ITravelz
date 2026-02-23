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
    'сул аялал', 'сул tour', 'сул байна', 'available', 'аялалууд', 'packag',
    'tour ', 'аялал',
  ],
  price: [
    'үнэ', 'хэд', 'price', 'cost', 'how much', 'үнэтэй', 'хямд', 'cheap',
    'expensive', 'budget', 'хямдрал', 'хөнгөлөлт', 'discount', 'төгрөг', 'usd', '$',
  ],
  booking: [
    'захиалах', 'захиалга', 'book', 'reserve', 'booking', 'захиалж', 'хэрхэн захиалах',
    'how to book', 'sign up', 'бүртгэх', 'бүртгүүлэх',
  ],
  itinerary: [
    'itinerary', 'хөтөлбөр', 'day by day', 'schedule', 'хуваарь', 'өдрийн',
    'тплан', 'plan', 'program', 'програм',
  ],
  destination: [
    'destination', 'газар', 'байршил', 'орон', 'улс', 'country', 'city',
    'where', 'хаана', 'аялах газар', 'travel to',
  ],
  contact: [
    'холбогдох', 'contact', 'phone', 'утас', 'email', 'имейл', 'address', 'хаяг',
    'reach', 'call', 'message', 'мессежийн', 'social',
  ],
  services: [
    'үйлчилгээ', 'service', 'what do you offer', 'санал', 'offer',
  ],
  help: [
    'help', 'тусалж', 'юу хийн', 'юу хийж', 'чадах', 'what can', 'how can',
    'menu', 'options', 'сонголт',
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
    const { message, history = [] } = req.body;
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
      const systemPrompt = buildSystemPrompt(packages, itineraries, destinations, services);
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
        reply = `📞 **Бидэнтэй холбогдох:**\n\n• 📧 Email: ${process.env.FROM_EMAIL || 'info@itravelz.com'}\n• 🌐 Вебсайт: **[Contact хуудас](/contact)**\n\nМанай холбоо барих хуудсаар дамжуулан мессеж илгээж болно.\n\n👉 **[Холбогдох](/contact)**`;
        break;

      case 'services':
        reply = fmtServices(services);
        break;

      case 'help':
        reply = `🤖 **Би дараах зүйлст тусалж чадна:**\n\n• 🌍 Аялалын жагсаалт харах\n• 💵 Үнэ лавлах\n• ✈️ Аялах газрууд\n• 🗺 Аялалын хөтөлбөр\n• 📋 Захиалга хийх заавар\n• 🛎 Үйлчилгээний мэдээлэл\n• 📞 Холбоо барих\n\nЖишээ асуултууд:\n_"Ямар аялал байна вэ?"_\n_"Bali tour хэд вэ?"_\n_"Захиалга хэрхэн хийх вэ?"_`;
        break;

      default: {
        // Fuzzy search: check if message contains any package/destination name
        const lower2 = message.toLowerCase();
        const pkgHints = packages.filter((p) =>
          lower2.includes(p.destination?.toLowerCase() || '') ||
          lower2.includes(p.category?.toLowerCase() || '')
        );
        if (pkgHints.length) {
          reply = `🔍 Таны хайлттай холбоотой аялалууд:\n\n`;
          pkgHints.slice(0, 4).forEach((p, i) => {
            reply += `${i + 1}. **${p.name}** — $${Number(p.price).toLocaleString()} · ${p.destination || '—'}\n`;
          });
          reply += `\n👉 **[Бүх аялал харах](/packages)**`;
        } else {
          reply = `🤔 Уучлаарай, тодорхой хариулт өгч чадахгүй байна.\n\nДараах зүйлсийг асууж болно:\n• _"Ямар tours байна вэ?"_\n• _"Үнэ хэд вэ?"_\n• _"Захиалга хэрхэн хийх вэ?"_\n• _"Ямар газар аялдаг вэ?"_\n\n📞 Дэлгэрэнгүй мэдэхийг хүсвэл **[бидэнтэй холбогдоорой](/contact)**.`;
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
function buildSystemPrompt(packages, itineraries, destinations, services) {
  let prompt = `You are ITravelz's friendly AI travel assistant. Answer in the same language the user writes in (Mongolian or English).
Be helpful, concise, and enthusiastic about travel. Use emojis appropriately.

AVAILABLE PACKAGES (${packages.length} total):
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

When recommending specific packages, always include price and booking link like: [Book ${'{name}'}](/booking?package=${'{id}'}).
For listings, provide /packages, /itineraries, /destinations links.
Keep responses under 250 words.`;
  return prompt;
}
