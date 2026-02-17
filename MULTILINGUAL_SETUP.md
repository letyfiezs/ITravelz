# Multilingual Package & Itinerary Setup Guide

## Overview
Your TravelHub website now supports **7 languages** for all dynamically added packages and itineraries:
- English (en)
- Spanish (es)
- French (fr)
- Japanese (ja)
- Chinese (zh)
- Arabic (ar)
- Dutch (nl)
- Mongolian (mn)

## How It Works

### Frontend
- When users select a language from the dropdown, the website automatically displays packages and itineraries in that language
- The language preference is saved in localStorage and persists across sessions
- When language changes, packages and itineraries are reloaded with translated content

### Backend Database
- Packages and Itineraries now have a `translations` field that stores content for all 8 languages
- Each language has translated versions of: name, description, duration, destination, category, features, etc.

### Admin API
When adding or updating packages/itineraries through the API, you must provide translations for all languages.

## API Request Format

### Adding a Package with Translations

```json
POST /api/packages

{
  "name": "Bali Paradise Tour",
  "description": "Experience the beauty of Bali",
  "price": 2500,
  "category": "Beach",
  "duration": "7 Days",
  "destination": "Bali, Indonesia",
  "image": "https://example.com/bali.jpg",
  "features": ["Hotel Stay", "Guided Tours"],
  "status": "active",
  "availableDates": ["2024-12-20", "2024-12-21"],
  "availableTimes": ["09:00", "14:00"],
  "bookingLimitPerSlot": 5,
  "translations": {
    "en": {
      "name": "Bali Paradise Tour",
      "description": "Experience the beauty of Bali",
      "duration": "7 Days",
      "destination": "Bali, Indonesia",
      "category": "Beach",
      "features": ["Hotel Stay", "Guided Tours"]
    },
    "es": {
      "name": "Tour Paraíso de Bali",
      "description": "Experimenta la belleza de Bali",
      "duration": "7 Días",
      "destination": "Bali, Indonesia",
      "category": "Playa",
      "features": ["Estancia en Hotel", "Tours Guiados"]
    },
    "fr": {
      "name": "Tour Paradis de Bali",
      "description": "Découvrez la beauté de Bali",
      "duration": "7 Jours",
      "destination": "Bali, Indonésie",
      "category": "Plage",
      "features": ["Séjour à l'Hôtel", "Visites Guidées"]
    },
    "ja": {
      "name": "バリ パラダイス ツアー",
      "description": "バリの美しさを体験してください",
      "duration": "7日間",
      "destination": "バリ、インドネシア",
      "category": "ビーチ",
      "features": ["ホテル滞在", "ガイド付きツアー"]
    },
    "zh": {
      "name": "巴厘岛天堂之旅",
      "description": "体验巴厘岛的美丽",
      "duration": "7天",
      "destination": "巴厘岛，印度尼西亚",
      "category": "海滩",
      "features": ["酒店住宿", "导游之旅"]
    },
    "ar": {
      "name": "جولة جنة بالي",
      "description": "اختبر جمال بالي",
      "duration": "7 أيام",
      "destination": "بالي، إندونيسيا",
      "category": "شاطئ",
      "features": ["إقامة الفندق", "جولات موجهة"]
    },
    "nl": {
      "name": "Bali Paradise Tour",
      "description": "Ervaar de schoonheid van Bali",
      "duration": "7 Dagen",
      "destination": "Bali, Indonesië",
      "category": "Strand",
      "features": ["Hotelverblijf", "Begeleide Tours"]
    },
    "mn": {
      "name": "Балийн Рай Аялал",
      "description": "Балийн үзэсгэлэнтэй байж үзэнэ үү",
      "duration": "7 Өдөр",
      "destination": "Бали, Индонез",
      "category": "Эрэг",
      "features": ["Зочид буудлын байраа", "Удирдлагатай аялалууд"]
    }
  }
}
```

### Adding an Itinerary with Translations

```json
POST /api/itineraries

{
  "title": "10-Day Southeast Asia Adventure",
  "description": "Explore Thailand, Vietnam, and Cambodia",
  "duration": "10 Days",
  "locations": "3 Countries",
  "difficulty": "moderate",
  "order": 1,
  "days": [
    { "dayNumber": "1", "title": "Arrival in Bangkok" },
    { "dayNumber": "2-3", "title": "Bangkok City Tour" },
    { "dayNumber": "4-5", "title": "Phuket Beach" },
    { "dayNumber": "6-7", "title": "Ho Chi Minh City" },
    { "dayNumber": "8-10", "title": "Siem Reap & Angkor Wat" }
  ],
  "translations": {
    "en": {
      "title": "10-Day Southeast Asia Adventure",
      "description": "Explore Thailand, Vietnam, and Cambodia",
      "duration": "10 Days",
      "locations": "3 Countries",
      "days": [
        { "dayNumber": "1", "title": "Arrival in Bangkok" },
        { "dayNumber": "2-3", "title": "Bangkok City Tour" },
        { "dayNumber": "4-5", "title": "Phuket Beach" },
        { "dayNumber": "6-7", "title": "Ho Chi Minh City" },
        { "dayNumber": "8-10", "title": "Siem Reap & Angkor Wat" }
      ]
    },
    "es": {
      "title": "Aventura de 10 Días en el Sudeste Asiático",
      "description": "Explora Tailandia, Vietnam y Camboya",
      "duration": "10 Días",
      "locations": "3 Países",
      "days": [
        { "dayNumber": "1", "title": "Llegada a Bangkok" },
        { "dayNumber": "2-3", "title": "Tour por la Ciudad de Bangkok" },
        { "dayNumber": "4-5", "title": "Playa de Phuket" },
        { "dayNumber": "6-7", "title": "Ciudad de Ho Chi Minh" },
        { "dayNumber": "8-10", "title": "Siem Reap y Angkor Wat" }
      ]
    },
    "fr": {
      "title": "Aventure de 10 Jours en Asie du Sud-Est",
      "description": "Explorez la Thaïlande, le Vietnam et le Cambodge",
      "duration": "10 Jours",
      "locations": "3 Pays",
      "days": [
        { "dayNumber": "1", "title": "Arrivée à Bangkok" },
        { "dayNumber": "2-3", "title": "Visite de la Ville de Bangkok" },
        { "dayNumber": "4-5", "title": "Plage de Phuket" },
        { "dayNumber": "6-7", "title": "Ville de Ho Chi Minh" },
        { "dayNumber": "8-10", "title": "Siem Reap et Angkor Wat" }
      ]
    },
    "ja": {
      "title": "10日間の東南アジア冒険",
      "description": "タイ、ベトナム、カンボジアを探索",
      "duration": "10日間",
      "locations": "3つの国",
      "days": [
        { "dayNumber": "1", "title": "バンコク到着" },
        { "dayNumber": "2-3", "title": "バンコク市内ツアー" },
        { "dayNumber": "4-5", "title": "プーケットビーチ" },
        { "dayNumber": "6-7", "title": "ホーチミンシティ" },
        { "dayNumber": "8-10", "title": "シェムリアプ＆アンコールワット" }
      ]
    },
    "zh": {
      "title": "10天东南亚冒险",
      "description": "探索泰国、越南和柬埔寨",
      "duration": "10天",
      "locations": "3个国家",
      "days": [
        { "dayNumber": "1", "title": "抵达曼谷" },
        { "dayNumber": "2-3", "title": "曼谷城市之旅" },
        { "dayNumber": "4-5", "title": "普吉岛海滩" },
        { "dayNumber": "6-7", "title": "胡志明市" },
        { "dayNumber": "8-10", "title": "暹粒和吴哥窟" }
      ]
    },
    "ar": {
      "title": "مغامرة جنوب شرق آسيا لمدة 10 أيام",
      "description": "استكشف تايلاند وفيتنام وكمبوديا",
      "duration": "10 أيام",
      "locations": "3 دول",
      "days": [
        { "dayNumber": "1", "title": "الوصول إلى بانكوك" },
        { "dayNumber": "2-3", "title": "جولة في مدينة بانكوك" },
        { "dayNumber": "4-5", "title": "شاطئ بوكيت" },
        { "dayNumber": "6-7", "title": "مدينة هو تشي منه" },
        { "dayNumber": "8-10", "title": "سيم ريب وأنكور وات" }
      ]
    },
    "nl": {
      "title": "10-daags Zuidoost-Azië Avontuur",
      "description": "Verken Thailand, Vietnam en Cambodja",
      "duration": "10 Dagen",
      "locations": "3 Landen",
      "days": [
        { "dayNumber": "1", "title": "Aankomst in Bangkok" },
        { "dayNumber": "2-3", "title": "Bangkok Stadsrondleiding" },
        { "dayNumber": "4-5", "title": "Phuket Strand" },
        { "dayNumber": "6-7", "title": "Ho Chi Minh Stad" },
        { "dayNumber": "8-10", "title": "Siem Reap en Angkor Wat" }
      ]
    },
    "mn": {
      "title": "10 өдрийн Зүүн Өмнөд Азийн Адал",
      "description": "Тайланд, Вьетнам, Камбож судлах",
      "duration": "10 Өдөр",
      "locations": "3 Улс",
      "days": [
        { "dayNumber": "1", "title": "Бангкок руу ирэх" },
        { "dayNumber": "2-3", "title": "Бангкокын хотын аялал" },
        { "dayNumber": "4-5", "title": "Пхукет цэргийн эргийн" },
        { "dayNumber": "6-7", "title": "Хo Чи Минxийн хот" },
        { "dayNumber": "8-10", "title": "Сием Riэп ба Ангкор Ватт" }
      ]
    }
  }
}
```

## Implementation Tips

### Using curl to Add a Package
```bash
curl -X POST http://localhost:5000/api/packages \
  -H "Content-Type: application/json" \
  -d @package_data.json
```

### Using Postman
1. Create a new POST request to `http://localhost:5000/api/packages`
2. Set headers: `Content-Type: application/json`
3. Paste the JSON payload from above in the Body section
4. Send the request

### Important Notes
- If you don't provide `translations`, the system will use the English fields as default for all languages
- Always include translations for all 8 languages for consistent multilingual support
- The `features` array should contain translated strings for each language
- For `days` in itineraries, make sure `dayNumber` and `title` are translated

## Frontend Features
- Language selector in the top navigation bar
- Automatically displays packages and itineraries in selected language
- Language preference persists across sessions
- Supports RTL (right-to-left) layout for Arabic language
- When language changes, packages and itineraries reload with translated content

## Troubleshooting

### Packages/Itineraries not translating?
1. Check that the `translations` object was saved in the database
2. Verify the language code matches (en, es, fr, ja, zh, ar, nl, mn)
3. Check browser console for any errors

### Missing translations for certain languages?
- The system will fall back to the default English version if a translation is missing
- Always provide all language translations for best user experience

## Future Enhancements
- Admin panel UI for entering translations directly
- Automatic translation using Google Translate API
- Translation management interface for updating existing items
