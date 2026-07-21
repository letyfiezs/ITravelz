#!/usr/bin/env node

// One-off migration: retroactively complete translations for content that
// already existed before ensureFullTranslations() was wired into create/update.
// Older docs may be missing languages entirely (de/ko) or have the same text
// duplicated across the wrong language keys (en/es/fr/ar/nl) — this backfills
// every SUPPORTED_LANGS entry properly.
//
// Usage:
//   node scripts/backfillTranslations.js                 # apply changes
//   node scripts/backfillTranslations.js --dry-run        # preview only, no writes
//   node scripts/backfillTranslations.js --limit=10       # only touch up to 10 documents
//                                                          # (safe for spreading a big backfill
//                                                          # across several days of free-tier quota)
//
// Stops immediately (without erroring) if MyMemory's free daily quota runs
// out mid-run — re-run later (same day once quota resets, or tomorrow) to
// pick up where it left off; already-translated documents are skipped.

require('dotenv').config();
const mongoose = require('mongoose');
const { ensureFullTranslations, isQuotaExhausted, getProviderStatus } = require('../utils/autoTranslate');

const Package = require('../models/Package');
const Destination = require('../models/Destination');
const Festival = require('../models/Festival');
const Itinerary = require('../models/Itinerary');
const AboutMongolia = require('../models/AboutMongolia');

const DRY_RUN = process.argv.includes('--dry-run');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

const TARGETS = [
  {
    label: 'Package',
    Model: Package,
    fieldsOf: (doc) => ({
      name: doc.name,
      description: doc.description,
      duration: doc.duration,
      destination: doc.destination,
      features: doc.features || [],
    }),
  },
  {
    label: 'Destination',
    Model: Destination,
    fieldsOf: (doc) => ({
      name: doc.name,
      tagline: doc.tagline || '',
      description: doc.description || '',
      readMore: doc.readMore || '',
      culturalInfo: doc.culturalInfo || '',
    }),
  },
  {
    label: 'Festival',
    Model: Festival,
    fieldsOf: (doc) => ({
      name: doc.name,
      description: doc.description || '',
    }),
  },
  {
    label: 'Itinerary',
    Model: Itinerary,
    fieldsOf: (doc) => ({
      title: doc.title,
      description: doc.description,
      duration: doc.duration,
      locations: doc.locations,
    }),
  },
  {
    label: 'AboutMongolia',
    Model: AboutMongolia,
    fieldsOf: (doc) => ({
      title: doc.title,
      description: doc.description,
      readMore: doc.readMore || '',
    }),
  },
];

const run = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Error: MONGO_URI not set in environment');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log(
    `[DB] Connected to MongoDB${DRY_RUN ? '  (dry run — no writes will be made)' : ''}` +
      (Number.isFinite(LIMIT) ? `  (limit: ${LIMIT} document(s))` : ''),
  );

  let touched = 0;
  let stoppedForQuota = false;

  outer: for (const { label, Model, fieldsOf } of TARGETS) {
    const docs = await Model.find();
    console.log(`\n=== ${label}: ${docs.length} document(s) ===`);

    for (const doc of docs) {
      if (touched >= LIMIT) {
        console.log(`  (limit of ${LIMIT} reached, stopping)`);
        break outer;
      }

      const fields = fieldsOf(doc);
      const before = JSON.stringify(doc.translations || {});
      const fullTranslations = await ensureFullTranslations(fields, doc.translations || {});
      const after = JSON.stringify(fullTranslations);

      if (before === after) {
        // NOTE: this can mean two very different things — genuinely already
        // translated, OR a translation attempt was made but MyMemory failed
        // (quota/rate-limit) and silently fell back to the unchanged text.
        // Always check quota status below before trusting "skipped" as good news.
        console.log(`  - ${doc._id}  already complete, skipped`);
      } else {
        console.log(`  - ${doc._id}  ${DRY_RUN ? 'would update' : 'updating'} (${fields.name || fields.title})`);
        if (!DRY_RUN) {
          doc.translations = fullTranslations;
          await doc.save();
        }
        touched++;
      }

      if (isQuotaExhausted()) {
        const { googleBlocked, myMemoryExhausted, laraConfigured, laraBlocked } = getProviderStatus();
        const dead = [
          googleBlocked && 'Google Translate (rate-limited/blocked)',
          myMemoryExhausted && 'MyMemory (daily quota exhausted)',
          laraConfigured ? (laraBlocked && 'Lara Translate (quota exhausted/blocked)') : 'Lara Translate (not configured)',
        ].filter(Boolean).join(' AND ');
        console.log(`\n  All translation providers are down — ${dead}. Stopping here.`);
        console.log('  Re-run the same command later to pick up where this left off.');
        stoppedForQuota = true;
        break outer;
      }
    }
  }

  console.log(`\n${touched} document(s) ${DRY_RUN ? 'would be' : 'were'} updated.${stoppedForQuota ? ' (stopped early — quota exhausted)' : ''}`);
  console.log('Done.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
