const axios = require("axios");
const { translate: googleTranslate } = require("@vitalets/google-translate-api");
const { Credentials, Translator: LaraTranslator } = require("@translated/lara");

// The 6 languages the site actually supports (frontend/src/context/LanguageContext.jsx)
const SUPPORTED_LANGS = ["mn", "en", "de", "ko", "ja", "zh"];

// Lara Translate uses full locale codes rather than bare language codes.
const LARA_LOCALE = { mn: "mn-MN", en: "en-US", de: "de-DE", ko: "ko-KR", ja: "ja-JP", zh: "zh-CN" };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Three independent free translation providers, tried in order. Each one can
// die independently (Google's unofficial endpoint can get IP-blocked;
// MyMemory has a small daily word quota; Lara's free API tier is capped at
// 10k chars/month) — falling back through them keeps translation working as
// long as at least one is up, rather than the whole feature going dark the
// moment one of them has a bad day.
let googleBlocked = false;
let myMemoryExhausted = false;
let laraBlocked = false;
const laraConfigured = Boolean(process.env.LARA_ACCESS_KEY_ID && process.env.LARA_ACCESS_KEY_SECRET);
let laraClient = null;
const getLaraClient = () => {
  if (!laraClient) {
    laraClient = new LaraTranslator(
      new Credentials(process.env.LARA_ACCESS_KEY_ID, process.env.LARA_ACCESS_KEY_SECRET),
    );
  }
  return laraClient;
};

// True only once every configured provider is known dead — callers use this
// to stop attempting further translations entirely rather than burning
// time/requests on calls that are certain to fail.
const isQuotaExhausted = () => googleBlocked && myMemoryExhausted && (!laraConfigured || laraBlocked);
// For diagnostics/logging — which provider(s) actually failed.
const getProviderStatus = () => ({ googleBlocked, myMemoryExhausted, laraConfigured, laraBlocked });

// Google Translate via its unofficial public web endpoint (no API key,
// generous practical limits, good quality) — but it's reverse-engineered,
// not an official API, so it can be rate-limited/blocked without warning.
const translateViaGoogle = async (text, from, to) => {
  if (googleBlocked) return null;
  try {
    const res = await googleTranslate(text, { from, to });
    return res?.text || null;
  } catch (err) {
    if (err.status === 429 || err.statusCode === 429) googleBlocked = true;
    return null;
  } finally {
    await sleep(250); // pace requests to reduce the chance of tripping Google's rate limiter
  }
};

// MyMemory free API: 500 chars/segment, ~a few hundred words/day in
// practice. Answers quota-exceeded with an actual HTTP 429 (not just a 200
// with a warning string in the body) — validateStatus is required or axios
// throws before we ever get to inspect the body.
const translateViaMyMemory = async (text, from, to) => {
  if (myMemoryExhausted) return null;
  try {
    const chunk = text.slice(0, 490);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${from}|${to}`;
    const { data, status } = await axios.get(url, { timeout: 8000, validateStatus: () => true });
    const translated = data?.responseData?.translatedText;
    if (status === 429 || translated?.includes("MYMEMORY WARNING")) {
      myMemoryExhausted = true;
      return null;
    }
    if (!translated) return null;
    if (translated.includes("PLEASE REVIEW")) return null;
    if (data.responseStatus && data.responseStatus !== 200) return null;
    return translated;
  } catch {
    return null;
  } finally {
    await sleep(150);
  }
};

// Lara Translate (official SDK, no credit card required to sign up) — small
// free tier (10k chars/month) so it's kept as a last-resort fallback rather
// than the primary provider. Silently unavailable if LARA_ACCESS_KEY_ID /
// LARA_ACCESS_KEY_SECRET aren't configured.
const translateViaLara = async (text, from, to) => {
  if (!laraConfigured || laraBlocked) return null;
  try {
    const result = await getLaraClient().translate(text, LARA_LOCALE[from] || from, LARA_LOCALE[to] || to);
    return result?.translation || null;
  } catch (err) {
    // Any hard failure (quota exceeded, invalid credentials, etc.) — stop
    // trying Lara for the rest of this process rather than retrying per call.
    if (err.status === 429 || err.statusCode === 429 || err.status === 401 || err.statusCode === 401) {
      laraBlocked = true;
    }
    return null;
  } finally {
    await sleep(150);
  }
};

// Translate a single string: Google Translate first, MyMemory next, Lara
// Translate last, original text unchanged if every provider is unavailable.
const translateOne = async (text, from, to) => {
  if (!text || !text.trim() || from === to) return text;
  if (isQuotaExhausted()) return text; // every provider known dead — don't waste time

  const google = await translateViaGoogle(text, from, to);
  if (google !== null) return google;

  const myMemory = await translateViaMyMemory(text, from, to);
  if (myMemory !== null) return myMemory;

  const lara = await translateViaLara(text, from, to);
  if (lara !== null) return lara;

  return text; // fall back to original if every provider failed
};

// Heuristic: Cyrillic-heavy text is Mongolian, otherwise assume English
const detectSourceLang = (fields) => {
  const combined = Object.values(fields)
    .flat()
    .filter((v) => typeof v === "string")
    .join(" ");
  const letters = combined.replace(/\s/g, "").length;
  if (!letters) return "en";
  const cyrillic = (combined.match(/[Ѐ-ӿ]/g) || []).length;
  return cyrillic > letters * 0.15 ? "mn" : "en";
};

// Translate a single field value (string or string[]) from `from` to `to`
const translateField = async (val, from, to) => {
  if (Array.isArray(val)) {
    const out = [];
    for (const item of val) {
      out.push(typeof item === "string" ? await translateOne(item, from, to) : item);
    }
    return out;
  }
  if (typeof val === "string") return translateOne(val, from, to);
  return val;
};

/**
 * Ensure a content item has a complete translation entry for every
 * supported language. Any language already present in `existing` with a
 * non-empty value for every field is left untouched (so a manual admin
 * "Auto Translate" click, or a previous save, isn't wastefully re-translated);
 * everything else is machine-translated from the detected/declared source
 * language, so a package/destination/etc. is never left partially translated.
 *
 * @param {Object} fields    source-language field values, e.g. { name, description, features }
 * @param {Object} [existing] previously stored translations object (may be {} or undefined)
 * @param {string} [sourceLang] override auto-detected source language
 * @returns {Promise<Object>} translations object covering every SUPPORTED_LANGS entry
 */
// A prior failed translation attempt (MyMemory down/rate-limited) silently
// falls back to the original text, so a language entry that's merely
// "non-empty" isn't proof it was actually translated — it may just be the
// source text copied verbatim into the wrong language slot. For any
// non-source language, reject an entry whose value is byte-for-byte
// identical to the source field (source text legitimately unchanged by
// translation, e.g. a proper noun, is rare enough that re-translating it —
// which just returns the same string again — costs nothing).
const looksUntranslated = (val, sourceVal) => {
  if (Array.isArray(sourceVal)) {
    return Array.isArray(val) && val.length === sourceVal.length && val.every((v, i) => v === sourceVal[i]);
  }
  return val === sourceVal;
};

const ensureFullTranslations = async (fields, existing = {}, sourceLang) => {
  const from = sourceLang || detectSourceLang(fields);
  // Sanitize to a plain object and drop any stray undefined-valued keys —
  // legacy documents (e.g. Mongoose nested-schema paths that were never set)
  // can carry own properties whose value is literally `undefined`, which
  // fails Mongoose's cast validation if passed straight back into a save.
  const cleanExisting = JSON.parse(JSON.stringify(existing || {}));
  const result = { ...cleanExisting };

  for (const lang of SUPPORTED_LANGS) {
    const current = result[lang];
    const alreadyComplete =
      current &&
      Object.keys(fields).every((key) => {
        const v = current[key];
        if (Array.isArray(fields[key])) {
          if (!Array.isArray(v) || v.length !== fields[key].length) return false;
        } else if (typeof v !== "string" || v.trim().length === 0) {
          return false;
        }
        if (lang !== from && looksUntranslated(v, fields[key])) return false;
        return true;
      });
    if (alreadyComplete) continue;

    const entry = { ...(current || {}) };
    for (const [key, val] of Object.entries(fields)) {
      entry[key] = lang === from ? val : await translateField(val, from, lang);
    }
    result[lang] = entry;
  }

  return result;
};

module.exports = {
  SUPPORTED_LANGS,
  translateOne,
  detectSourceLang,
  ensureFullTranslations,
  isQuotaExhausted,
  getProviderStatus,
};
