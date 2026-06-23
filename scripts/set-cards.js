// scripts/set-cards.js
// Actualiza tarjetas de un partido manualmente
//
// Uso:
//   node scripts/set-cards.js <fixtureId> <cod1> <amarillas1> <rojas1> <cod2> <amarillas2> <rojas2>
//
// Ejemplo:
//   node scripts/set-cards.js CAN_QAT CAN 1 0 QAT 1 2

require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase }         = require('firebase-admin/database');
const serviceAccount = require('./serviceAccountKey.json');

const [,, fixtureId, cod1, y1, r1, cod2, y2, r2] = process.argv;

if (!fixtureId || !cod1 || !cod2 || y1 === undefined || r1 === undefined || y2 === undefined || r2 === undefined) {
  console.error('Uso: node scripts/set-cards.js <fixtureId> <cod1> <amarillas1> <rojas1> <cod2> <amarillas2> <rojas2>');
  console.error('Ej:  node scripts/set-cards.js CAN_QAT CAN 1 0 QAT 1 2');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
});
const db = getDatabase();

async function run() {
  await db.ref(`discipline/${cod1}_${fixtureId}`).set({ yellow: parseInt(y1), red: parseInt(r1) });
  await db.ref(`discipline/${cod2}_${fixtureId}`).set({ yellow: parseInt(y2), red: parseInt(r2) });

  console.log(`✅ ${fixtureId}`);
  console.log(`   ${cod1}: 🟡${y1} 🔴${r1}`);
  console.log(`   ${cod2}: 🟡${y2} 🔴${r2}`);
  process.exit(0);
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });
