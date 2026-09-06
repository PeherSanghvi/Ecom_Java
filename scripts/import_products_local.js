'use strict';

const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/ecommerce';
const EXPORT_FILE = path.join(__dirname, '..', 'products_export.json');

function parseExtendedJson(raw) {
  // Convert Extended JSON ($oid, $date) to native types
  const obj = JSON.parse(raw);

  function convert(v) {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(convert);
    if (v.$oid) return new ObjectId(v.$oid);
    if (v.$date) return new Date(v.$date);
    const out = {};
    for (const k of Object.keys(v)) out[k] = convert(v[k]);
    return out;
  }
  return convert(obj);
}

async function main() {
  const client = new MongoClient(LOCAL_URI);
  try {
    await client.connect();
    const col = client.db('ecommerce').collection('products');

    const lines = fs.readFileSync(EXPORT_FILE, 'utf8')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    console.log(`Importing ${lines.length} products into 127.0.0.1:27017/ecommerce ...`);

    let inserted = 0, updated = 0, errors = 0;
    for (const line of lines) {
      try {
        const doc = parseExtendedJson(line);
        const { _id, ...rest } = doc;
        const result = await col.replaceOne({ _id }, { _id, ...rest }, { upsert: true });
        if (result.upsertedCount > 0) inserted++;
        else updated++;
      } catch (e) {
        console.error('Error on line:', e.message);
        errors++;
      }
    }

    const total = await col.countDocuments({ active: true });
    console.log(`Done. inserted=${inserted} updated=${updated} errors=${errors}`);
    console.log(`Total active products in local DB: ${total}`);
  } finally {
    await client.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
