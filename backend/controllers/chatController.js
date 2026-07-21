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

const SUPPORTED_LANGUAGES = ['en', 'mn', 'de'];

const TRANSLATIONS = {
  en: {
    noMessage: 'Please type a question.',
    greeting: '👋 Hello! Welcome to Itravelmongolia! I am your Mongolia travel assistant. Ask me about tours, prices, itineraries, destinations, or booking.',
    farewell: '👋 Goodbye! Have a great trip! If you have more questions, just ask.',
    booking: '📋 **Booking guide:**\n\n1. Visit the **[Packages](/packages)** page\n2. Choose your favorite tour\n3. Click **Book Now**\n4. Fill in your information\n5. Receive confirmation\n\n👉 **[Book now](/packages)**\n\nIf you want booking help for a specific tour, mention its name.',
    contact: '📞 **Contact Itravelmongolia:**\n\n• 📧 **Email:** sales@itravelmongolia.com\n• 📱 **Phone / WhatsApp:** +976 77088055\n• 📘 **Facebook:** [Itravelmongolia](https://www.facebook.com/profile.php?id=100068557103724)\n• 🕐 **Hours:** Everyday 24/7\n\n👉 Use the **[Contact page](/contact)** to send a message.',
    visa: '🛂 **Mongolia Visa Information:**\n\nCitizens of many countries can visit Mongolia **visa-free for up to 30 days**.\n\n✅ **Visa-free countries include:** USA, EU, UK, Japan, South Korea, and 60+ others.\n\n❌ **Visa required:** Some nationalities require a tourist visa — apply at a Mongolian embassy or online via evisa.mn.\n\n📋 **Required documents:** Valid passport (6+ months), return ticket, accommodation confirmation.\n\n👉 **[See our tours](/packages)** — we can assist with visa invitation letters for group bookings.\n\n_Always verify with the official Mongolian embassy for your country._',
    weather: '🌤 **Mongolia Weather & Best Travel Time:**\n\n**☀️ Summer (Jun–Sep):** Best time to visit! Warm days 20–30°C, ideal for Gobi and steppe tours.\n**🍂 Autumn (Sep–Oct):** Cool weather, beautiful landscapes, fewer crowds.\n**❄️ Winter (Nov–Mar):** Very cold (-20 to -40°C) but unique experiences like the Eagle Festival.\n**🌸 Spring (Apr–May):** Warming up, good for off-season travel.\n\n💡 **Most popular:** July–August — Naadam Festival.\n\n👉 **[See available tours](/packages)**',
    accommodation: '🏕 **Accommodation in Mongolia:**\n\n**🏡 Ger Camps (Tourist Gers):** Traditional portable homes set up in beautiful nature — most popular for tours. Comfortable beds, meals included.\n**🏨 Hotels (Ulaanbaatar):** Wide range from budget guesthouses to 5-star hotels.\n**⛺ Camping:** Available on private/custom tours in remote areas.\n\nAll our **[tour packages](/packages)** include accommodation.',
    transport: '🚌 **Getting Around Mongolia:**\n\n**✈️ International flights:** Chinggis Khaan International Airport (ULN), Ulaanbaatar — connections from Seoul, Beijing, Moscow, Istanbul.\n**🚐 Tour vehicles:** All our tours include 4WD Russian Furgon vans perfect for off-road Mongolia travel.\n**🚂 Trans-Mongolian Railway:** Runs Ulaanbaatar–Beijing and Ulaanbaatar–Moscow.\n**🚌 Local buses:** Budget option between major cities.\n\nAll **[our packages](/packages)** include ground transportation throughout the tour.',
    food: '🍖 **Mongolian Food & Cuisine:**\n\n**🥟 Buuz:** Steamed dumplings with minced meat — Mongolia\'s most beloved dish.\n**🥟 Khuushuur:** Deep-fried meat pastries, especially popular during Naadam.\n**🍜 Tsuivan:** Noodles stir-fried with meat and vegetables.\n**🥛 Airag:** Fermented mare\'s milk — a traditional drink you must try!\n**🍲 Khorkhog:** Lamb cooked with hot stones inside a container — a true nomadic feast.\n\nMost ger camp tour packages include traditional Mongolian meals throughout the journey.\n\n👉 **[Browse food-inclusive tours](/packages)**',
    group: '👥 **Group Tours in Mongolia:**\n\n**Small group tours (2–12 people):** We specialize in small, personalized groups for a better experience.\n**Private tours:** Available for any group size — fully customized itinerary.\n**Solo travelers:** Can join scheduled group departures at lower cost.\n\n📅 **Fixed departure dates** available June–September for Gobi, Central Mongolia, and Khuvsgul tours.\n\n👉 **[View all group tours](/packages)** or **[contact us](/contact)** to build a custom group tour.',
    help: '🤖 **I can help you with:**\n\n• 🌍 Browse Mongolia tours & packages\n• 💵 Check pricing & budgets\n• ✈️ Explore destinations (Gobi, Khuvsgul, etc.)\n• 🗺 View tour itineraries\n• 🛂 Visa & entry requirements\n• 🌤 Weather & best travel times\n• 🏕 Accommodation (ger camps, hotels)\n• 🚐 Transport & getting around\n• 🍖 Mongolian food & culture\n• 📋 How to book\n• 📞 Contact our team\n\n_Ask in English, Mongolian, or German._',
    fallback: '🤔 Sorry, I could not answer that.\n\n• _"What tours are available?"_\n• _"How much do tours cost?"_\n• _"How do I book?"_\n\n👉 **[Browse tours](/packages)** · **[Contact us](/contact)**',
    packagesHeader: '🌍 **Current tours:**',
    packagesEmpty: '😔 No active tours are available right now. More will be added soon!',
    packagesFooter: '\n👉 View details and booking on the **[Packages page](/packages)**.',
    itinerariesHeader: '🗺 **Itineraries:**',
    itinerariesEmpty: '😔 No itineraries are available right now.',
    itinerariesFooter: '👉 **[Itineraries page](/itineraries)**',
    destinationsHeader: '✈️ **Available destinations:**',
    destinationsEmpty: '😔 No destinations are available right now.',
    destinationsFooter: '\n👉 **[Destinations page](/destinations)**',
    servicesHeader: '🛎 **Our services:**',
    servicesEmpty: '😔 No services are available right now.',
    servicesFooter: '\n👉 **[Services page](/services)**',
    packageLocation: 'Location',
    packageDuration: 'Duration',
    packagePrice: 'Price',
    packageCategory: 'Category',
    packageFeatures: 'Included features',
    packageBooking: 'Booking link',
    bookHere: 'Book here',
    matchingToursHeader: 'Matching tours:',
    viewAllTours: 'View all tours',
    priceTitle: '💵 **Price information:**\n\n',
    priceCheapest: '• Cheapest: **$%s** (%s)\n',
    priceMostExpensive: '• Most expensive: **$%s** (%s)\n\n',
    priceFooter: 'View all prices on the **[Packages page](/packages)**\n\n_Mention a tour name for a specific price._',
    priceNoData: '💵 No active package information is available.',
  },
  mn: {
    noMessage: 'Та асуулт бичнэ үү.',
    greeting: '👋 Сайн байна уу! Itravelmongolia-д тавтай морил! Би таны Монгол аяллын туслах бот байна. Аялал, үнэ, хөтөлбөр, газрууд, захиалгын талаар асуугаарай.',
    farewell: '👋 Баяртай! Сайхан аялаарай! Дахин асуулт байвал бичээрэй.',
    booking: '📋 **Захиалга хийх заавар:**\n\n1. **[Packages](/packages)** хуудас руу очно уу\n2. Таалагдсан аялалаа сонгоно\n3. **Book Now** товч дарна\n4. Мэдээллээ бөглөж, баталгаажуулалт хүлээнэ\n\n👉 **[Одоо захиалах](/packages)**\n\nТодорхой аяллын захиалгын талаар асуухдаа нэрийг дурдаарай.',
    contact: '📞 **Itravelmongolia-тай холбогдох:**\n\n• 📧 **Имэйл:** sales@itravelmongolia.com\n• 📱 **Утас / WhatsApp:** +976 77088055\n• 📘 **Facebook:** [Itravelmongolia](https://www.facebook.com/profile.php?id=100068557103724)\n• 🕐 **Цагийн хуваарь:** Everyday 24/7\n\n👉 **[Contact page](/contact)** хуудас руу орж зурвас илгээнэ үү.',
    visa: '🛂 **Монголын визний мэдээлэл:**\n\nОлон улсын иргэд 30 хүртэл хоног Монгол улсад визгүй зорчих боломжтой.\n\n✅ **Визгүй орнууд:** АНУ, ЕУ, Их Британи, Япон, Солонгос болон бусад 60 гаруй улс.\n\n❌ **Виз шаардлагатай:** Зарим иргэн виз авах шаардлагатай — монгол элчин сайдын яам эсвэл evisa.mn сайтаар үйлдэнэ.\n\n📋 **Шаардлагатай баримт бичиг:** 6-с дээш сар хүчинтэй паспорт, буцах тасалбар, байрны баталгааг авч явах.\n\n👉 **[See our tours](/packages)** — бүлгийн захиалгад визний урилга бичгийг тусалж гаргана.\n\n_Өөрийн улсын албан ёсны элчин сайдын яамаар баталгаажуулна уу._',
    weather: '🌤 **Монголын цаг агаар, аялах хамгийн тохиромжтой үе:**\n\n**☀️ Зун (6–9-р сар):** Зуны улирал хамгийн сайхан, 20–30°C, говь болон тал нутгийн аялалд тохиромжтой.\n**🍂 Намар (9–10-р сар):** Хүйтэрч, үзэсгэлэнт байгаль, цөөн жуулчид.\n**❄️ Өвөл (11–3-р сар):** Маш хүйтэн (-20–40°C) боловч өвөрмөц туршлага, Бүргэдийн наадам.\n**🌸 Хавар (4–5-р сар):** Халж эхлэнэ, улиралын гадна аялалд тохиромжтой.\n\n💡 **Хамгийн түгээмэл:** 7–8-р сар — Наадам хамгийн үзэсгэлэнтэй!\n\n👉 **[See available tours](/packages)**',
    accommodation: '🏕 **Монгол дахь байр:**\n\n**🏡 Гер буудал:** Байгалийн үзэсгэлэнт газарт байрлах уламжлалт гэрүүд. Хоол орсон, тухтай.\n**🏨 Улаанбаатар дахь зочид буудал:** Бюджет зочид буудлаас таван од хүртэл.\n**⛺ Кэмп:** Алслагдсан аялалд тохиромжтой.\n\nМанай бүх **[tour packages](/packages)** байр оролцуулсан.',
    transport: '🚌 **Монголд яаж аялдаг вэ:**\n\n**✈️ Олон улсын нислэг:** Чингис хаан олон улсын нисэх буудал (ULN), Улаанбаатар — Сөүл, Бээжин, Москва, Стамбул руу холболттой.\n**🚐 Тур автомашин:** Бидний аялалд 4WD фургон машиныг ашиглана.\n**🚂 Транс-Монголын галт тэрэг:** Улаанбаатар–Бээжин, Улаанбаатар–Москва чиглэлд.\n**🚌 Орон нутгийн автобус:** Тосгон, хот хоорондын хямд сонголт.\n\nБидний **[packages](/packages)** бүх газарт тээвэр оролцуулсан.',
    food: '🍖 **Монголын хоол, соёл:**\n\n**🥟 Бууз:** Хонины махтай бууз — Монголын хамгийн дуртай хоол.\n**🥟 Хуушуур:** Наадам дээр их хэрэглэгддэг шарсан махтай боов.\n**🍜 Цуйван:** Мах, ногоогоор хийсэн хуурсан гоймон.\n**🥛 Айраг:** Ферментжүүлсэн морьдын сүү — уламжлалт ундаа.\n**🍲 Хорхог:** Халуун чулуугаар чанасан хонины мах — жинхэнэ уямгийн туршлага.\n\nИхэнх ger camp package-ууд нь уламжлалт хоолыг багтаасан.\n\n👉 **[Browse packages](/packages)**',
    group: '👥 **Бүлгийн аялал:**\n\n**Жижиг бүлгийн аялал (2–12 хүн):** Илүү хувийн үйлчилгээтэй.\n**Хувийн аялал:** Бүлгийн хэмжээ хамаарахгүй.\n**Ганцаар аялагч:** Бага зардлаар бүлгийн аялалд нэгдэн орж болно.\n\n📅 **Гарах цаг:** 6–9-р сар, Говь, Төв Монгол, Хөвсгөл.\n\n👉 **[Бүх аялалを見る](/packages)** эсвэл **[Холбогдох](/contact)**.',
    help: '🤖 **Би танд тусалж чадна:**\n\n• 🌍 Монгол дахь аялал, пакет унших\n• 💵 Үнэ болон төсөв шалгах\n• ✈️ Зорчих газруудыг судлах\n• 🗺 Аяллын хөтөлбөр харах\n• 🛂 Виз болон оролтын шаардлага\n• 🌤 Цаг агаар болон хамгийн сайн аяллын цаг\n• 🏕 Байрлах газар (гер, зочид буудал)\n• 🚐 Тээвэр болон явах арга\n• 🍖 Хоол болон соёл\n• 📋 Захиалах\n• 📞 Багтай холбогдох\n\n_Англи, Монгол, Герман хэл дээр асуугаарай._',
    fallback: '🤔 Уучлаарай, таны асуултанд хариулах боломжгүй байна.\n\n• _"Ямар аялал байна вэ?"_\n• _"Үнэ хэд вэ?"_\n• _"Яаж захиалах вэ?"_\n\n👉 **[Бүх аялал](/packages)** · **[Холбогдох](/contact)**',
    packagesHeader: '🌍 **Одоогийн аялалууд:**',
    packagesEmpty: '😔 Одоогоор идэвхтэй аялал байхгүй байна. Удахгүй шинэ аялалууд нэмэгдэнэ!',
    packagesFooter: '\n👉 Дэлгэрэнгүй мэдээлэл авах болон захиалга хийхийн тулд **[Packages хуудас](/packages)**-руу очно уу.',
    itinerariesHeader: '🗺 **Аяллын хөтөлбөрүүд:**',
    itinerariesEmpty: '😔 Одоогоор хөтөлбөр байхгүй байна.',
    itinerariesFooter: '👉 Бүх хөтөлбөрийг харах: **[Itineraries хуудас](/itineraries)**',
    destinationsHeader: '✈️ **Аялах боломжтой газрууд:**',
    destinationsEmpty: '😔 Одоогоор тохируулсан газар байхгүй.',
    destinationsFooter: '\n👉 **[Destinations хуудас](/destinations)**',
    servicesHeader: '🛎 **Манай үйлчилгээнүүд:**',
    servicesEmpty: '😔 Одоогоор үйлчилгээний жагсаалт байхгүй.',
    servicesFooter: '\n👉 **[Services хуудас](/services)**',
    packageLocation: 'Байршил',
    packageDuration: 'Хугацаа',
    packagePrice: 'Үнэ',
    packageCategory: 'Ангилал',
    packageFeatures: 'Багтсан үйлчилгээ',
    packageBooking: 'Захиалгын холбоос',
    bookHere: 'Энд дарна уу',
    matchingToursHeader: 'Таарах аялалууд:',
    viewAllTours: 'Бүх аялалуудыг харах',
    priceTitle: '💵 **Үнийн мэдээлэл:**\n\n',
    priceCheapest: '• Хамгийн хямд: **$%s** (%s)\n',
    priceMostExpensive: '• Хамгийн үнэтэй: **$%s** (%s)\n\n',
    priceFooter: 'Бүх үнэ болон аяллын мэдээллийг **[Packages хуудас](/packages)**-аас үзнэ үү.\n\n_Тодорхой нэр асуухад илүү мэдээлэл өгнө._',
    priceNoData: '💵 Одоогоор үнийн мэдээлэл байхгүй байна.',
  },
  de: {
    noMessage: 'Bitte geben Sie eine Frage ein.',
    greeting: '👋 Hallo! Willkommen bei Itravelmongolia! Ich bin Ihr Mongoleireise-Assistent. Fragen Sie mich nach Touren, Preisen, Reiserouten, Zielen oder Buchung.',
    farewell: '👋 Auf Wiedersehen! Ich wünsche Ihnen eine schöne Reise! Wenn Sie weitere Fragen haben, fragen Sie gern.',
    booking: '📋 **Buchungsanleitung:**\n\n1. Besuchen Sie die **[Packages](/packages)** Seite\n2. Wählen Sie Ihre Lieblingstour\n3. Klicken Sie auf **Book Now**\n4. Füllen Sie Ihre Informationen aus\n5. Erhalten Sie die Bestätigung\n\n👉 **[Jetzt buchen](/packages)**\n\nWenn Sie Hilfe bei einer bestimmten Tour benötigen, nennen Sie bitte den Namen.',
    contact: '📞 **Kontakt Itravelmongolia:**\n\n• 📧 **E-Mail:** sales@itravelmongolia.com\n• 📱 **Telefon / WhatsApp:** +976 77088055\n• 📘 **Facebook:** [Itravelmongolia](https://www.facebook.com/profile.php?id=100068557103724)\n• 🕐 **Öffnungszeiten:** Jeden Tag 24/7\n\n👉 Verwenden Sie die **[Kontaktseite](/contact)**, um eine Nachricht zu senden.',
    visa: '🛂 **Mongolei Visa Informationen:**\n\nViele Staatsbürger können die Mongolei **bis zu 30 Tage visafrei** besuchen.\n\n✅ **Visafreie Länder:** USA, EU, UK, Japan, Südkorea und 60+ andere.\n\n❌ **Visapflicht:** Einige Nationalitäten benötigen ein Touristenvisum — beantragen Sie es bei einer mongolischen Botschaft oder online über evisa.mn.\n\n📋 **Benötigte Dokumente:** Gültiger Reisepass (6+ Monate), Rückflugticket, Unterkunftsbestätigung.\n\n👉 **[Siehe unsere Touren](/packages)** — wir können bei Einladungsschreiben helfen.\n\n_Überprüfen Sie dies immer bei Ihrer lokalen mongolischen Botschaft._',
    weather: '🌤 **Mongolei Wetter & beste Reisezeit:**\n\n**☀️ Sommer (Jun–Sep):** Beste Reisezeit! Warme Tage 20–30°C, ideal für Gobi und Steppe.\n**🍂 Herbst (Sep–Okt):** Kühler, schöne Landschaften, weniger Touristen.\n**❄️ Winter (Nov–Mär):** Sehr kalt (-20 bis -40°C), aber einzigartige Erlebnisse wie das Adlerfest.\n**🌸 Frühling (Apr–Mai):** Wärmer, gut für die Nebensaison.\n\n💡 **Am beliebtesten:** Juli–August — Naadam Festival.\n\n👉 **[Siehe verfügbare Touren](/packages)**',
    accommodation: '🏕 **Unterkunft in der Mongolei:**\n\n**🏡 Ger Camps:** Traditionelle portable Jurten in schöner Natur — beliebt bei Touristen. Komfortable Betten, Mahlzeiten inklusive.\n**🏨 Hotels (Ulaanbaatar):** Von günstigen Gasthäusern bis zu 5-Sterne-Hotels.\n**⛺ Camping:** Auf privaten/individuellen Touren verfügbar.\n\nAlle unsere **[Touren](/packages)** beinhalten Unterkunft.',
    transport: '🚌 **Unterwegs in der Mongolei:**\n\n**✈️ Internationale Flüge:** Chinggis Khaan International Airport (ULN), Ulaanbaatar — Verbindungen nach Seoul, Peking, Moskau, Istanbul.\n**🚐 Tourfahrzeuge:** Unsere Touren nutzen 4WD Furgon Vans für Offroad-Strecken.\n**🚂 Transmongolische Eisenbahn:** Ulaanbaatar–Peking und Ulaanbaatar–Moskau.\n**🚌 Lokale Busse:** Günstige Option zwischen Städten.\n\nAlle unsere **[Pakete](/packages)** beinhalten Landtransport.',
    food: '🍖 **Mongolisches Essen & Küche:**\n\n**🥟 Buuz:** Gedämpfte Teigtaschen mit Fleisch — Mongoliens Lieblingsgericht.\n**🥟 Khuushuur:** Frittierte Fleischpasteten, besonders beliebt beim Naadam.\n**🍜 Tsuivan:** Gebratene Nudeln mit Fleisch und Gemüse.\n**🥛 Airag:** Fermentierte Stutenmilch — traditionelles Getränk.\n**🍲 Khorkhog:** Lamm mit heißen Steinen gekocht — echtes Nomadenerlebnis.\n\nDie meisten unserer Ger-Camp-Touren enthalten traditionelle Mahlzeiten.\n\n👉 **[Durchsuchen Sie tours](/packages)**',
    group: '👥 **Gruppentouren in der Mongolei:**\n\n**Kleine Gruppen (2–12 Personen):** Wir bieten personalisierte Reisen für ein besseres Erlebnis.\n**Privattouren:** Für jede Gruppengröße verfügbar — vollständig angepasst.\n**Alleinreisende:** Können niedrigere Preise für geplante Gruppentouren nutzen.\n\n📅 **Festgelegte Abfahrtsdaten** im Juni–September für Gobi, Zentralmongolei und Khuvsgul.\n\n👉 **[Alle Touren ansehen](/packages)** oder **[Kontakt](/contact)**.',
    help: '🤖 **Ich kann Ihnen helfen mit:**\n\n• 🌍 Touren & Pakete erkunden\n• 💵 Preise & Budget prüfen\n• ✈️ Ziele entdecken (Gobi, Khuvsgul usw.)\n• 🗺 Reiserouten ansehen\n• 🛂 Visa- & Einreisebestimmungen\n• 🌤 Wetter & beste Reisezeit\n• 🏕 Unterkunft (Ger Camps, Hotels)\n• 🚐 Transport & Fortbewegung\n• 🍖 Essen & Kultur\n• 📋 Buchung\n• 📞 Kontakt zum Team\n\n_Ask in Mongolian, English, or German._',
    fallback: '🤔 Entschuldigung, darauf habe ich keine Antwort.\n\n• _"Welche Touren gibt es?"_\n• _"Wie viel kostet eine Tour?"_\n• _"Wie buche ich?"_\n\n👉 **[Alle Touren](/packages)** · **[Kontakt](/contact)**',
    packagesHeader: '🌍 **Aktuelle Touren:**',
    packagesEmpty: '😔 Momentan sind keine aktiven Touren verfügbar.',
    packagesFooter: '\n👉 Details und Buchung auf der **[Packages page](/packages)**.',
    itinerariesHeader: '🗺 **Reiserouten:**',
    itinerariesEmpty: '😔 Momentan sind keine Reiserouten verfügbar.',
    itinerariesFooter: '👉 **[Itineraries page](/itineraries)**',
    destinationsHeader: '✈️ **Verfügbare Reiseziele:**',
    destinationsEmpty: '😔 Momentan keine Ziele verfügbar.',
    destinationsFooter: '\n👉 **[Destinations page](/destinations)**',
    servicesHeader: '🛎 **Unsere Leistungen:**',
    servicesEmpty: '😔 Momentan keine Dienstleistungen verfügbar.',
    servicesFooter: '\n👉 **[Services page](/services)**',
    packageLocation: 'Ort',
    packageDuration: 'Dauer',
    packagePrice: 'Preis',
    packageCategory: 'Kategorie',
    packageFeatures: 'Enthaltene Leistungen',
    packageBooking: 'Buchungslink',
    bookHere: 'Hier buchen',
    matchingToursHeader: 'Passende Touren:',
    viewAllTours: 'Alle Touren ansehen',
    priceTitle: '💵 **Preisinformation:**\n\n',
    priceCheapest: '• Günstigste: **$%s** (%s)\n',
    priceMostExpensive: '• Teuerste: **$%s** (%s)\n\n',
    priceFooter: 'Siehe alle Preise auf der **[Packages page](/packages)**\n\n_Nenne einen Tournamen für einen spezifischen Preis._',
    priceNoData: '💵 Keine aktiven Preisinformationen verfügbar.',
  },
};

function tr(lang, key) {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dictionary[key] || TRANSLATIONS.en[key] || key;
}

function detectLanguage(msg, uiLocale = 'auto') {
  if (!msg || !msg.trim()) return SUPPORTED_LANGUAGES.includes(uiLocale) ? uiLocale : 'en';
  const text = msg.trim();
  const lower = text.toLowerCase();

  if (/[А-Яа-яЁё]/.test(text)) return 'mn';
  if (/[äöüß]/i.test(text) || /\b(der|die|das|und|oder|bitte|danke|touren|reisen|preis|wie|wann|buch|reservieren)\b/.test(lower)) return 'de';
  if (/\b(hello|hi|how|what|where|when|price|tour|book|contact|visa|weather|hotel|travel)\b/.test(lower)) return 'en';
  if (/[\u0400-\u04FF]/.test(text)) return 'mn';
  return SUPPORTED_LANGUAGES.includes(uiLocale) ? uiLocale : 'en';
}

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

function buildLocalizedPriceReply(language, packages, message) {
  const lower = message.toLowerCase();
  const priceMatch = packages.find((p) =>
    lower.includes(p.name.toLowerCase()) ||
    (p.destination && lower.includes(p.destination.toLowerCase()))
  );

  if (priceMatch) {
    return `${tr(language, 'priceTitle')}**${priceMatch.name}** — $${Number(priceMatch.price).toLocaleString()} / хүн\n${tr(language, 'packageLocation')}: ${priceMatch.destination || '—'} · ${tr(language, 'packageDuration')}: ${priceMatch.duration || '—'}`;
  }

  if (!packages.length) {
    return tr(language, 'priceNoData');
  }

  const sorted = [...packages].sort((a, b) => a.price - b.price);
  const min = sorted[0].price;
  const max = sorted[sorted.length - 1].price;
  return `${tr(language, 'priceTitle')}${tr(language, 'priceCheapest').replace('%s', Number(min).toLocaleString()).replace('%s', sorted[0].name)}${tr(language, 'priceMostExpensive').replace('%s', Number(max).toLocaleString()).replace('%s', sorted[sorted.length - 1].name)}${tr(language, 'priceFooter')}`;
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
    const { message, history = [], language: uiLanguage = 'auto' } = req.body;
    const errorLanguage = SUPPORTED_LANGUAGES.includes(uiLanguage) ? uiLanguage : 'en';
    if (!message || !message.trim()) {
      return res.status(400).json({ reply: tr(errorLanguage, 'noMessage') });
    }

    const language = detectLanguage(message, uiLanguage);

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
      reply += `📍 ${tr(language, 'packageLocation')}: ${mentioned.destination || '—'}\n`;
      reply += `⏱ ${tr(language, 'packageDuration')}: ${mentioned.duration || '—'}\n`;
      reply += `💵 ${tr(language, 'packagePrice')}: $${Number(mentioned.price).toLocaleString()} / хүн\n`;
      reply += `🏷 ${tr(language, 'packageCategory')}: ${mentioned.category || '—'}\n`;
      if (mentioned.description) reply += `\n📝 ${mentioned.description.slice(0, 150)}${mentioned.description.length > 150 ? '…' : ''}\n`;
      if ((mentioned.features || []).length) {
        reply += `\n✅ ${tr(language, 'packageFeatures')}:\n`;
        mentioned.features.slice(0, 5).forEach((f) => { reply += `  • ${f}\n`; });
      }
      reply += `\n👉 ${tr(language, 'bookHere')}: **[${tr(language, 'bookHere')}](/booking?package=${mentioned._id})**`;
      return res.json({ reply });
    }

    switch (intent) {
      case 'greeting':
        reply = tr(language, 'greeting');
        break;

      case 'farewell':
        reply = tr(language, 'farewell');
        break;

      case 'packages_list':
        reply = fmtPackages(packages, language);
        break;

      case 'price':
        reply = buildLocalizedPriceReply(language, packages, message);
        break;

      case 'booking':
        reply = tr(language, 'booking');
        break;

      case 'itinerary':
        reply = fmtItineraries(itineraries, language);
        break;

      case 'destination':
        reply = fmtDestinations(destinations, language);
        break;

      case 'contact':
        reply = tr(language, 'contact');
        break;

      case 'services':
        reply = fmtServices(services, language);
        break;

      case 'visa':
        reply = tr(language, 'visa');
        break;

      case 'weather':
        reply = tr(language, 'weather');
        break;

      case 'accommodation':
        reply = tr(language, 'accommodation');
        break;

      case 'transport':
        reply = tr(language, 'transport');
        break;

      case 'food':
        reply = tr(language, 'food');
        break;

      case 'group':
        reply = tr(language, 'group');
        break;

      case 'help':
        reply = tr(language, 'help');
        break;

      default: {
        const lower2 = message.toLowerCase();
        const pkgHints = packages.filter((p) =>
          lower2.includes(p.destination?.toLowerCase() || '') ||
          lower2.includes(p.category?.toLowerCase() || '') ||
          lower2.includes(p.name?.toLowerCase() || '')
        );
        if (pkgHints.length) {
          reply = `🔍 **${tr(language, 'matchingToursHeader')}**\n\n`;
          pkgHints.slice(0, 4).forEach((p, i) => {
            reply += `${i + 1}. **${p.name}** — $${Number(p.price).toLocaleString()} · ${p.destination || '—'}\n`;
          });
          reply += `\n👉 **[${tr(language, 'viewAllTours')}](/packages)**`;
        } else {
          reply = tr(language, 'fallback');
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
  let prompt = `You are Itravelmongolia's friendly AI travel assistant.
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
