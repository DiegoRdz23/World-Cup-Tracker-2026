// scripts/sync-results.js
// Sincroniza resultados (y tarjetas) de API-Football → Firebase
//
// Uso:
//   node scripts/sync-results.js            ← solo resultados
//   node scripts/sync-results.js --cards    ← resultados + tarjetas (usa más requests)
//
// Requisitos previos:
//   1. npm install --save-dev firebase-admin dotenv
//   2. Descargar serviceAccountKey.json desde Firebase Console →
//      Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada
//      Guardar como: scripts/serviceAccountKey.json
//   3. Agregar en .env.local:
//        API_FOOTBALL_KEY=tu_clave_aqui

require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase }         = require('firebase-admin/database');
const serviceAccount = require('./serviceAccountKey.json');

// ── Verificar configuración ───────────────────────────────────────────────────
if (!process.env.FOOTBALL_DATA_KEY) {
  console.error('❌ Falta FOOTBALL_DATA_KEY en .env.local');
  process.exit(1);
}
if (!process.env.VITE_FIREBASE_DATABASE_URL) {
  console.error('❌ Falta VITE_FIREBASE_DATABASE_URL en .env.local');
  process.exit(1);
}

// ── Firebase Admin ────────────────────────────────────────────────────────────
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
});
const db = getDatabase();

// ── Mapeo nombre API-Football → código interno ────────────────────────────────
// Si algún equipo no se reconoce, agrégalo aquí con el nombre exacto que devuelve la API
const NAME_TO_CODE = {
  'Mexico': 'MEX',
  'South Korea': 'KOR',
  'Czech Republic': 'CZE', 'Czechia': 'CZE',
  'South Africa': 'RSA',
  'Switzerland': 'SUI',
  'Qatar': 'QAT',
  'Canada': 'CAN',
  'Bosnia': 'BIH', 'Bosnia and Herzegovina': 'BIH', 'Bosnia-Herzegovina': 'BIH',
  'Brazil': 'BRA',
  'Morocco': 'MAR',
  'Scotland': 'SCO',
  'Haiti': 'HAI',
  'United States': 'USA', 'USA': 'USA',
  'Turkey': 'TUR', 'Turkiye': 'TUR',
  'Australia': 'AUS',
  'Paraguay': 'PAR',
  'Germany': 'GER',
  'Ecuador': 'ECU',
  "Ivory Coast": 'CIV', "Côte d'Ivoire": 'CIV', 'Cote d\'Ivoire': 'CIV',
  'Curacao': 'CUR', 'Curaçao': 'CUR',
  'Netherlands': 'NED',
  'Japan': 'JPN',
  'Sweden': 'SWE',
  'Tunisia': 'TUN',
  'Belgium': 'BEL',
  'Iran': 'IRN',
  'Egypt': 'EGY',
  'New Zealand': 'NZL',
  'Spain': 'ESP',
  'Uruguay': 'URU',
  'Saudi Arabia': 'KSA',
  'Cape Verde': 'CPV',
  'France': 'FRA',
  'Senegal': 'SEN',
  'Iraq': 'IRQ',
  'Norway': 'NOR',
  'Argentina': 'ARG',
  'Austria': 'AUT',
  'Algeria': 'ALG',
  'Jordan': 'JOR',
  'Portugal': 'POR',
  'Colombia': 'COL',
  'DR Congo': 'COD', 'Congo DR': 'COD', 'Democratic Republic of Congo': 'COD',
  'Uzbekistan': 'UZB',
  'England': 'ENG',
  'Croatia': 'CRO',
  'Ghana': 'GHA',
  'Panama': 'PAN',
};

// ── Fixtures válidos de fase de grupos ────────────────────────────────────────
const GROUPS = {
  A: ['MEX','RSA','KOR','CZE'], B: ['CAN','BIH','QAT','SUI'],
  C: ['BRA','MAR','HAI','SCO'], D: ['USA','PAR','AUS','TUR'],
  E: ['GER','CUR','CIV','ECU'], F: ['NED','JPN','SWE','TUN'],
  G: ['BEL','EGY','IRN','NZL'], H: ['ESP','CPV','KSA','URU'],
  I: ['FRA','SEN','IRQ','NOR'], J: ['ARG','ALG','AUT','JOR'],
  K: ['POR','COD','UZB','COL'], L: ['ENG','CRO','GHA','PAN'],
};

const VALID_FIXTURE_IDS = new Set();
for (const teams of Object.values(GROUPS)) {
  const [T1,T2,T3,T4] = teams;
  for (const [h,a] of [[T1,T2],[T3,T4],[T1,T3],[T2,T4],[T1,T4],[T2,T3]]) {
    VALID_FIXTURE_IDS.add(`${h}_${a}`);
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Llamada a football-data.org ───────────────────────────────────────────────
async function apiFetch(path) {
  const res = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_KEY },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

// ── Sincronizar tarjetas de un partido ───────────────────────────────────────
async function syncCards(matchId, homeCode, awayCode, ourFixtureId) {
  const data = await apiFetch(`/matches/${matchId}`);
  if (!data.bookings?.length) return;

  // Contar tarjetas por equipo
  const cards = {
    [homeCode]: { yellow: 0, red: 0 },
    [awayCode]: { yellow: 0, red: 0 },
  };

  for (const booking of data.bookings) {
    const teamName = booking.team?.name;
    const teamCode = NAME_TO_CODE[teamName];
    if (!teamCode || !cards[teamCode]) continue;

    if (booking.card === 'YELLOW_CARD')     cards[teamCode].yellow++;
    else if (booking.card === 'RED_CARD')   cards[teamCode].red++;
    else if (booking.card === 'YELLOW_RED_CARD') cards[teamCode].red++; // 2da amarilla = roja
  }

  for (const [code, { yellow, red }] of Object.entries(cards)) {
    const key = `${code}_${ourFixtureId}`;
    await db.ref(`discipline/${key}`).set({ yellow, red });
    console.log(`  🟡${yellow} 🔴${red} → ${code}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function sync() {
  const syncCards_flag = process.argv.includes('--cards');
  // Código de competición FIFA World Cup en football-data.org
  const COMPETITION = 'WC';

  console.log(`🌍 Obteniendo partidos del Mundial 2026…`);
  const data = await apiFetch(`/competitions/${COMPETITION}/matches`);

  if (!data.matches?.length) {
    console.error('❌ Sin datos. Verifica tu FOOTBALL_DATA_KEY o el código de competición.');
    console.error('Respuesta:', JSON.stringify(data).slice(0, 300));
    process.exit(1);
  }

  console.log(`📦 ${data.matches.length} partidos recibidos\n`);

  const FINISHED = ['FINISHED'];
  let updated = 0, skipped = 0, unknown = 0;

  for (const match of data.matches) {
    if (!FINISHED.includes(match.status)) {
      skipped++;
      continue;
    }

    const homeName = match.homeTeam.name;
    const awayName = match.awayTeam.name;
    const homeCode = NAME_TO_CODE[homeName] ?? NAME_TO_CODE[match.homeTeam.shortName];
    const awayCode = NAME_TO_CODE[awayName] ?? NAME_TO_CODE[match.awayTeam.shortName];

    if (!homeCode || !awayCode) {
      console.warn(`⚠ No reconocido: "${homeName}" vs "${awayName}"`);
      unknown++;
      continue;
    }

    const fixtureId = `${homeCode}_${awayCode}`;
    if (!VALID_FIXTURE_IDS.has(fixtureId)) {
      skipped++;
      continue;
    }

    const homeScore = match.score.fullTime.home;
    const awayScore = match.score.fullTime.away;

    await db.ref(`results/${fixtureId}`).set({ homeScore, awayScore, played: true });
    console.log(`✅ ${fixtureId}: ${homeScore}–${awayScore}`);

    if (syncCards_flag) {
      await sleep(7000); // 7s entre requests para no exceder el límite del free tier
      await syncCards(match.id, homeCode, awayCode, fixtureId);
    }

    updated++;
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`✅ Guardados:  ${updated} resultados de grupo`);
  console.log(`⏭ Pendientes: ${skipped} (no terminados o KO)`);
  if (unknown > 0) console.log(`❓ Sin mapeo:  ${unknown} (ver arriba para agregar en NAME_TO_CODE)`);
  console.log(`─────────────────────────────────`);

  process.exit(0);
}

sync().catch(err => {
  console.error('❌ Error inesperado:', err.message);
  process.exit(1);
});
