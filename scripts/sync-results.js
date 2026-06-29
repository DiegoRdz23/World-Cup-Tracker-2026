// scripts/sync-results.js
// Sincroniza resultados (y tarjetas) de football-data.org → Firebase
//
// Uso:
//   node scripts/sync-results.js            ← resultados de grupos + KO
//   node scripts/sync-results.js --cards    ← también tarjetas (lento, ~4 min)

require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase }         = require('firebase-admin/database');
const serviceAccount = require('./serviceAccountKey.json');

if (!process.env.FOOTBALL_DATA_KEY) {
  console.error('❌ Falta FOOTBALL_DATA_KEY en .env.local'); process.exit(1);
}
if (!process.env.VITE_FIREBASE_DATABASE_URL) {
  console.error('❌ Falta VITE_FIREBASE_DATABASE_URL en .env.local'); process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
});
const db = getDatabase();

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Mapeo nombre API → código interno ────────────────────────────────────────
const NAME_TO_CODE = {
  'Mexico': 'MEX', 'South Korea': 'KOR', 'Czech Republic': 'CZE', 'Czechia': 'CZE',
  'South Africa': 'RSA', 'Switzerland': 'SUI', 'Qatar': 'QAT', 'Canada': 'CAN',
  'Bosnia': 'BIH', 'Bosnia and Herzegovina': 'BIH', 'Bosnia-Herzegovina': 'BIH',
  'Brazil': 'BRA', 'Morocco': 'MAR', 'Scotland': 'SCO', 'Haiti': 'HAI',
  'United States': 'USA', 'USA': 'USA', 'Turkey': 'TUR', 'Turkiye': 'TUR',
  'Australia': 'AUS', 'Paraguay': 'PAR', 'Germany': 'GER', 'Ecuador': 'ECU',
  "Ivory Coast": 'CIV', "Côte d'Ivoire": 'CIV', "Cote d'Ivoire": 'CIV',
  'Curacao': 'CUR', 'Curaçao': 'CUR', 'Netherlands': 'NED', 'Japan': 'JPN',
  'Sweden': 'SWE', 'Tunisia': 'TUN', 'Belgium': 'BEL', 'Iran': 'IRN',
  'Egypt': 'EGY', 'New Zealand': 'NZL', 'Spain': 'ESP', 'Uruguay': 'URU',
  'Saudi Arabia': 'KSA', 'Cape Verde': 'CPV', 'France': 'FRA', 'Senegal': 'SEN',
  'Iraq': 'IRQ', 'Norway': 'NOR', 'Argentina': 'ARG', 'Austria': 'AUT',
  'Algeria': 'ALG', 'Jordan': 'JOR', 'Portugal': 'POR', 'Colombia': 'COL',
  'DR Congo': 'COD', 'Congo DR': 'COD', 'Democratic Republic of Congo': 'COD',
  'Uzbekistan': 'UZB', 'England': 'ENG', 'Croatia': 'CRO', 'Ghana': 'GHA', 'Panama': 'PAN',
};

// ── Datos de grupos y fixtures ────────────────────────────────────────────────
const GROUPS = {
  A: ['MEX','RSA','KOR','CZE'], B: ['CAN','BIH','QAT','SUI'],
  C: ['BRA','MAR','HAI','SCO'], D: ['USA','PAR','AUS','TUR'],
  E: ['GER','CUR','CIV','ECU'], F: ['NED','JPN','SWE','TUN'],
  G: ['BEL','EGY','IRN','NZL'], H: ['ESP','CPV','KSA','URU'],
  I: ['FRA','SEN','IRQ','NOR'], J: ['ARG','ALG','AUT','JOR'],
  K: ['POR','COD','UZB','COL'], L: ['ENG','CRO','GHA','PAN'],
};

const GROUP_FIXTURES = {};
const VALID_FIXTURE_IDS = new Set();

for (const [group, teams] of Object.entries(GROUPS)) {
  const [T1,T2,T3,T4] = teams;
  const fixtures = [
    { id: `${T1}_${T2}`, home: T1, away: T2 },
    { id: `${T3}_${T4}`, home: T3, away: T4 },
    { id: `${T1}_${T3}`, home: T1, away: T3 },
    { id: `${T2}_${T4}`, home: T2, away: T4 },
    { id: `${T1}_${T4}`, home: T1, away: T4 },
    { id: `${T2}_${T3}`, home: T2, away: T3 },
  ];
  GROUP_FIXTURES[group] = fixtures;
  fixtures.forEach(f => VALID_FIXTURE_IDS.add(f.id));
}

// ── KO fixtures (replica de ko-fixtures.js) ──────────────────────────────────
const KO_FIXTURES = [
  { id: 73,  round: 'R32', home: '2A',   away: '2B'   },
  { id: 74,  round: 'R32', home: '1E',   away: '3C'   },
  { id: 75,  round: 'R32', home: '1F',   away: '2C'   },
  { id: 76,  round: 'R32', home: '1C',   away: '2F'   },
  { id: 77,  round: 'R32', home: '1I',   away: '3F'   },
  { id: 78,  round: 'R32', home: '2E',   away: '2I'   },
  { id: 79,  round: 'R32', home: '1A',   away: '3H'   },
  { id: 80,  round: 'R32', home: '1L',   away: '3E'   },
  { id: 81,  round: 'R32', home: '1D',   away: '3B'   },
  { id: 82,  round: 'R32', home: '1G',   away: '3A'   },
  { id: 83,  round: 'R32', home: '2K',   away: '2L'   },
  { id: 84,  round: 'R32', home: '1H',   away: '2J'   },
  { id: 85,  round: 'R32', home: '1B',   away: '3G'   },
  { id: 86,  round: 'R32', home: '1J',   away: '2H'   },
  { id: 87,  round: 'R32', home: '1K',   away: '3D'   },
  { id: 88,  round: 'R32', home: '2D',   away: '2G'   },
  { id: 89,  round: 'R16', home: 'W74',  away: 'W77'  },
  { id: 90,  round: 'R16', home: 'W73',  away: 'W75'  },
  { id: 91,  round: 'R16', home: 'W76',  away: 'W78'  },
  { id: 92,  round: 'R16', home: 'W79',  away: 'W80'  },
  { id: 93,  round: 'R16', home: 'W83',  away: 'W84'  },
  { id: 94,  round: 'R16', home: 'W81',  away: 'W82'  },
  { id: 95,  round: 'R16', home: 'W86',  away: 'W88'  },
  { id: 96,  round: 'R16', home: 'W85',  away: 'W87'  },
  { id: 97,  round: 'QF',  home: 'W89',  away: 'W90'  },
  { id: 98,  round: 'QF',  home: 'W93',  away: 'W94'  },
  { id: 99,  round: 'QF',  home: 'W91',  away: 'W92'  },
  { id: 100, round: 'QF',  home: 'W95',  away: 'W96'  },
  { id: 101, round: 'SF',  home: 'W97',  away: 'W98'  },
  { id: 102, round: 'SF',  home: 'W99',  away: 'W100' },
  { id: 103, round: '3rd', home: 'L101', away: 'L102' },
  { id: 104, round: 'F',   home: 'W101', away: 'W102' },
];
const KO_BY_ID = Object.fromEntries(KO_FIXTURES.map(f => [f.id, f]));

// ── Standings (replica de simulation.js) ─────────────────────────────────────
function fairPlayPoints(teamCode, matchIds, discipline) {
  let pts = 0;
  for (const id of matchIds) {
    const d = discipline[`${teamCode}_${id}`];
    if (d) { pts -= (d.yellow ?? 0) * 1; pts -= (d.red ?? 0) * 3; }
  }
  return pts;
}

function getCurrentStandings(group, results, discipline) {
  const fixtures = GROUP_FIXTURES[group];
  const teams    = GROUPS[group];
  const st = Object.fromEntries(teams.map(t => [t, { code: t, pts: 0, gf: 0, ga: 0, gd: 0, w: 0, d: 0, l: 0 }]));

  for (const m of fixtures) {
    const r = results[m.id];
    if (!r?.played) continue;
    const { homeScore: hg, awayScore: ag } = r;
    st[m.home].gf += hg; st[m.home].ga += ag; st[m.home].gd += hg - ag;
    st[m.away].gf += ag; st[m.away].ga += hg; st[m.away].gd += ag - hg;
    if (hg > ag)        { st[m.home].pts += 3; st[m.home].w++; st[m.away].l++; }
    else if (hg === ag) { st[m.home].pts++;     st[m.home].d++; st[m.away].pts++; st[m.away].d++; }
    else                { st[m.away].pts += 3;  st[m.away].w++; st[m.home].l++; }
  }

  const matchIds = fixtures.map(f => f.id);
  return Object.values(st).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd  !== a.gd)  return b.gd  - a.gd;
    if (b.gf  !== a.gf)  return b.gf  - a.gf;
    const fpA = fairPlayPoints(a.code, matchIds, discipline);
    const fpB = fairPlayPoints(b.code, matchIds, discipline);
    if (fpB !== fpA) return fpB - fpA;
    return a.code.localeCompare(b.code);
  });
}

// ── Resolución de slots KO (replica de simulation.js) ────────────────────────
function resolveKOSlot(slotCode, allStandings, koResults) {
  const posMatch = slotCode.match(/^([123])([A-L])$/);
  if (posMatch) {
    const pos = parseInt(posMatch[1]) - 1;
    const group = posMatch[2];
    const st = allStandings[group];
    return st?.[pos]?.code ?? null;
  }

  const winMatch = slotCode.match(/^W(\d+)$/);
  if (winMatch) {
    const id = parseInt(winMatch[1]);
    const fixture = KO_BY_ID[id];
    const result  = koResults[String(id)];
    if (!fixture || !result?.played) return null;
    const home = resolveKOSlot(fixture.home, allStandings, koResults);
    const away = resolveKOSlot(fixture.away, allStandings, koResults);
    if (!home || !away) return null;
    return result.homeScore > result.awayScore ? home : away;
  }

  const loseMatch = slotCode.match(/^L(\d+)$/);
  if (loseMatch) {
    const id = parseInt(loseMatch[1]);
    const fixture = KO_BY_ID[id];
    const result  = koResults[String(id)];
    if (!fixture || !result?.played) return null;
    const home = resolveKOSlot(fixture.home, allStandings, koResults);
    const away = resolveKOSlot(fixture.away, allStandings, koResults);
    if (!home || !away) return null;
    return result.homeScore > result.awayScore ? away : home;
  }

  return null;
}

// ── Llamada a football-data.org ───────────────────────────────────────────────
async function apiFetch(path) {
  const res = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_KEY },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

// ── Sincronizar tarjetas de un partido ───────────────────────────────────────
async function syncCards(matchId, homeCode, awayCode, fixtureId) {
  const data = await apiFetch(`/matches/${matchId}`);
  if (!data.bookings?.length) return;

  const cards = { [homeCode]: { yellow: 0, red: 0 }, [awayCode]: { yellow: 0, red: 0 } };
  for (const b of data.bookings) {
    const code = NAME_TO_CODE[b.team?.name];
    if (!code || !cards[code]) continue;
    if (b.card === 'YELLOW_CARD')                 cards[code].yellow++;
    else if (b.card === 'RED_CARD')               cards[code].red++;
    else if (b.card === 'YELLOW_RED_CARD')        cards[code].red++;
  }

  for (const [code, { yellow, red }] of Object.entries(cards)) {
    await db.ref(`discipline/${code}_${fixtureId}`).set({ yellow, red });
    console.log(`  🟡${yellow} 🔴${red} → ${code}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function sync() {
  const withCards = process.argv.includes('--cards');
  const FINISHED  = ['FINISHED'];

  console.log('🌍 Obteniendo partidos del Mundial 2026…');
  const data = await apiFetch('/competitions/WC/matches');

  if (!data.matches?.length) {
    console.error('❌ Sin datos.', JSON.stringify(data).slice(0, 300));
    process.exit(1);
  }

  console.log(`📦 ${data.matches.length} partidos recibidos\n`);

  // ── 1. Fase de grupos ───────────────────────────────────────────────────────
  console.log('── Grupos ──────────────────────────────');
  let groupUpdated = 0, koUpdated = 0, skipped = 0, unknown = 0;
  const koMatches = []; // partidos KO terminados para procesar después

  for (const match of data.matches) {
    if (!FINISHED.includes(match.status)) { skipped++; continue; }

    const homeName = match.homeTeam.name;
    const awayName = match.awayTeam.name;
    const homeCode = NAME_TO_CODE[homeName] ?? NAME_TO_CODE[match.homeTeam.shortName];
    const awayCode = NAME_TO_CODE[awayName] ?? NAME_TO_CODE[match.awayTeam.shortName];

    if (!homeCode || !awayCode) {
      console.warn(`⚠ No reconocido: "${homeName}" vs "${awayName}"`);
      unknown++; continue;
    }

    // Determinar si es partido de grupo
    const fixtureId = VALID_FIXTURE_IDS.has(`${homeCode}_${awayCode}`)
      ? `${homeCode}_${awayCode}`
      : VALID_FIXTURE_IDS.has(`${awayCode}_${homeCode}`)
        ? `${awayCode}_${homeCode}`
        : null;

    if (fixtureId) {
      const isFlipped = fixtureId === `${awayCode}_${homeCode}`;
      const homeScore = isFlipped ? match.score.fullTime.away : match.score.fullTime.home;
      const awayScore = isFlipped ? match.score.fullTime.home : match.score.fullTime.away;

      await db.ref(`results/${fixtureId}`).set({ homeScore, awayScore, played: true });
      console.log(`✅ ${fixtureId}: ${homeScore}–${awayScore}`);

      if (withCards) {
        await sleep(7000);
        const h = isFlipped ? awayCode : homeCode;
        const a = isFlipped ? homeCode : awayCode;
        await syncCards(match.id, h, a, fixtureId);
      }

      groupUpdated++;
    } else {
      // Posible partido KO — guardar para procesar después
      koMatches.push({ match, homeCode, awayCode });
    }
  }

  // ── 2. Fase KO ──────────────────────────────────────────────────────────────
  if (koMatches.length > 0) {
    console.log('\n── KO ──────────────────────────────────');

    // Leer datos actuales de Firebase para resolver slots
    const [resultsSnap, koResultsSnap, disciplineSnap] = await Promise.all([
      db.ref('results').once('value'),
      db.ref('ko_results').once('value'),
      db.ref('discipline').once('value'),
    ]);
    const results    = resultsSnap.val()    ?? {};
    const koResults  = koResultsSnap.val()  ?? {};
    const discipline = disciplineSnap.val() ?? {};

    // Calcular standings de todos los grupos
    const allStandings = {};
    for (const g of Object.keys(GROUPS)) {
      allStandings[g] = getCurrentStandings(g, results, discipline);
    }

    // Resolver slots KO → mapa de pares de equipos a ID de fixture
    const pairToKOId = {};
    for (const fixture of KO_FIXTURES) {
      const home = resolveKOSlot(fixture.home, allStandings, koResults);
      const away = resolveKOSlot(fixture.away, allStandings, koResults);
      if (home && away) {
        pairToKOId[`${home}_${away}`] = fixture.id;
        pairToKOId[`${away}_${home}`] = fixture.id;
      }
    }

    for (const { match, homeCode, awayCode } of koMatches) {
      const koId = pairToKOId[`${homeCode}_${awayCode}`];
      if (!koId) {
        console.warn(`⚠ KO: no se pudo mapear ${homeCode} vs ${awayCode}`);
        skipped++; continue;
      }

      // Determinar quién es local en nuestro fixture
      const koFixture  = KO_BY_ID[koId];
      const resolvedHome = resolveKOSlot(koFixture.home, allStandings, koResults);
      const isFlipped  = resolvedHome !== homeCode;
      const homeScore  = isFlipped ? match.score.fullTime.away : match.score.fullTime.home;
      const awayScore  = isFlipped ? match.score.fullTime.home : match.score.fullTime.away;

      await db.ref(`ko_results/${koId}`).set({ homeScore, awayScore, played: true });
      console.log(`✅ P${koId} (${koFixture.round}): ${homeCode} ${homeScore}–${awayScore} ${awayCode}`);
      koUpdated++;
    }
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`✅ Grupos:    ${groupUpdated} resultados`);
  console.log(`✅ KO:        ${koUpdated} resultados`);
  console.log(`⏭ Pendientes: ${skipped} (no terminados)`);
  if (unknown > 0) console.log(`❓ Sin mapeo: ${unknown}`);
  console.log(`─────────────────────────────────`);

  process.exit(0);
}

sync().catch(err => { console.error('❌', err.message); process.exit(1); });
