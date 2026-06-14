import { TEAMS, GROUPS } from '../data/teams';
import { FIXTURES_BY_GROUP, FIXTURES } from '../data/fixtures';
import { KO_FIXTURE_BY_ID } from '../data/ko-fixtures';

// ─── Modelo de predicción ────────────────────────────────────────────────────
// Distribución de Poisson sobre goles esperados (xG)
// Rating base: ranking FIFA
// Lambda = BASE * (rating_ataque / AVG)^2 / (rating_defensa / AVG)^1.5

const BASE_LAMBDA = 1.15; // goles promedio por equipo en fase de grupos
const AVG_RATING = 1620;  // promedio aproximado de los 48 equipos

function getLambda(attackRating, defenseRating) {
  const attack  = Math.pow(attackRating  / AVG_RATING, 2.0);
  const defense = Math.pow(defenseRating / AVG_RATING, 1.5);
  return BASE_LAMBDA * attack / defense;
}

// Tabla de factoriales para Poisson
const _fact = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800];
function factorial(n) {
  if (n < _fact.length) return _fact[n];
  let r = _fact[_fact.length - 1];
  for (let i = _fact.length; i <= n; i++) r *= i;
  return r;
}

function poissonPMF(k, lambda) {
  if (k < 0 || lambda <= 0) return 0;
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}

// Muestrea un valor de distribución Poisson
function samplePoisson(lambda) {
  const L = Math.exp(-Math.min(lambda, 20));
  let k = 0, p = Math.random();
  while (p > L) { k++; p *= Math.random(); }
  return k - 1;
}

// ─── Probabilidades analíticas de un partido ─────────────────────────────────
export function getMatchProbs(homeCode, awayCode) {
  const h = TEAMS[homeCode]?.rating ?? 1500;
  const a = TEAMS[awayCode]?.rating ?? 1500;
  const lH = getLambda(h, a);
  const lA = getLambda(a, h);

  let win = 0, draw = 0, lose = 0;
  const MAX = 8;
  for (let i = 0; i <= MAX; i++) {
    for (let j = 0; j <= MAX; j++) {
      const p = poissonPMF(i, lH) * poissonPMF(j, lA);
      if (i > j) win  += p;
      else if (i === j) draw += p;
      else            lose += p;
    }
  }
  return { win, draw, lose, lH, lA };
}

// Calcula puntos Fair Play de un equipo para una lista de IDs de partido
// Amarilla: -1, Roja: -3. Menor puntaje = peor Fair Play.
export function fairPlayPoints(teamCode, matchIds, discipline) {
  let pts = 0;
  for (const id of matchIds) {
    const d = discipline[`${teamCode}_${id}`];
    if (d) {
      pts -= (d.yellow ?? 0) * 1;
      pts -= (d.red    ?? 0) * 3;
    }
  }
  return pts;
}

// ─── Standings actuales (solo partidos ya jugados) ───────────────────────────
export function getCurrentStandings(group, results, discipline = {}) {
  const teams    = GROUPS[group];
  const fixtures = FIXTURES_BY_GROUP[group];

  const st = Object.fromEntries(teams.map(t => [t, {
    code: t, pts: 0, gf: 0, ga: 0, gd: 0, w: 0, d: 0, l: 0, pj: 0,
  }]));

  for (const m of fixtures) {
    const r = results[m.id];
    if (!r?.played) continue;
    const { homeScore: hg, awayScore: ag } = r;
    st[m.home].gf += hg; st[m.home].ga += ag; st[m.home].gd += hg - ag; st[m.home].pj++;
    st[m.away].gf += ag; st[m.away].ga += hg; st[m.away].gd += ag - hg; st[m.away].pj++;
    if (hg > ag)       { st[m.home].pts += 3; st[m.home].w++; st[m.away].l++; }
    else if (hg === ag){ st[m.home].pts++; st[m.home].d++; st[m.away].pts++; st[m.away].d++; }
    else               { st[m.away].pts += 3; st[m.away].w++; st[m.home].l++; }
  }

  const matchIds = fixtures.map(f => f.id);

  return Object.values(st)
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd  !== a.gd)  return b.gd  - a.gd;
      if (b.gf  !== a.gf)  return b.gf  - a.gf;
      // 5° criterio: Fair Play (mayor puntaje = mejor, es decir menos negativo)
      const fpA = fairPlayPoints(a.code, matchIds, discipline);
      const fpB = fairPlayPoints(b.code, matchIds, discipline);
      if (fpB !== fpA) return fpB - fpA;
      return a.code.localeCompare(b.code);
    });
}

// ─── Simulación de grupo (una iteración) ─────────────────────────────────────
function simulateGroupOnce(group, results) {
  const teams    = GROUPS[group];
  const fixtures = FIXTURES_BY_GROUP[group];

  const st = Object.fromEntries(teams.map(t => [t, {
    pts: 0, gf: 0, ga: 0, gd: 0,
  }]));

  for (const m of fixtures) {
    let hg, ag;
    const r = results[m.id];
    if (r?.played) {
      hg = r.homeScore;
      ag = r.awayScore;
    } else {
      hg = samplePoisson(getLambda(TEAMS[m.home].rating, TEAMS[m.away].rating));
      ag = samplePoisson(getLambda(TEAMS[m.away].rating, TEAMS[m.home].rating));
    }
    st[m.home].gf += hg; st[m.home].ga += ag; st[m.home].gd += hg - ag;
    st[m.away].gf += ag; st[m.away].ga += hg; st[m.away].gd += ag - hg;
    if (hg > ag)      st[m.home].pts += 3;
    else if (hg === ag) { st[m.home].pts++; st[m.away].pts++; }
    else              st[m.away].pts += 3;
  }

  return teams
    .map(t => ({ code: t, ...st[t] }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || Math.random() - 0.5);
}

// ─── Simulación de partido eliminatorio (Bradley-Terry) ──────────────────────
function simulateKOMatch(codeA, codeB) {
  const rA = TEAMS[codeA]?.rating ?? 1500;
  const rB = TEAMS[codeB]?.rating ?? 1500;
  return Math.random() < rA / (rA + rB) ? codeA : codeB;
}

// ─── Monte Carlo completo ─────────────────────────────────────────────────────
// Devuelve probabilidades por equipo: pQualify, pTop8, pFinal, pChampion
export function runMonteCarlo(results, iterations = 8000) {
  const counts = {};
  for (const code of Object.keys(TEAMS)) {
    counts[code] = { qualify: 0, top8: 0, final: 0, champion: 0 };
  }

  for (let sim = 0; sim < iterations; sim++) {
    const groupStandings = {};
    const allThirds = [];

    // 1. Simular fase de grupos
    for (const group of Object.keys(GROUPS)) {
      const st = simulateGroupOnce(group, results);
      groupStandings[group] = st;
      counts[st[0].code].qualify++;
      counts[st[1].code].qualify++;
      if (st[2]) allThirds.push({ code: st[2].code, pts: st[2].pts, gd: st[2].gd, gf: st[2].gf });
    }

    // 2. Mejores 8 terceros
    const best8 = allThirds
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || Math.random() - 0.5)
      .slice(0, 8);
    best8.forEach(t => counts[t.code].qualify++);

    // 3. Armar bracket de 32
    let bracket = [];
    for (const group of Object.keys(GROUPS)) {
      const st = groupStandings[group];
      bracket.push(st[0].code);
      bracket.push(st[1].code);
    }
    best8.forEach(t => bracket.push(t.code));

    // Mezclar bracket (simulación de emparejamientos)
    for (let i = bracket.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bracket[i], bracket[j]] = [bracket[j], bracket[i]];
    }

    // 4. Rondas eliminatorias
    let round = [...bracket];
    while (round.length > 1) {
      const next = [];
      for (let i = 0; i < round.length; i += 2) {
        next.push(simulateKOMatch(round[i], round[i + 1]));
      }
      if (round.length === 8)  next.forEach(c => counts[c].top8++);
      if (round.length === 4)  next.forEach(c => counts[c].final++);
      if (round.length === 2)  counts[next[0]].champion++;
      round = next;
    }
  }

  // Normalizar a probabilidades
  const probs = {};
  for (const code of Object.keys(TEAMS)) {
    const c = counts[code];
    probs[code] = {
      pQualify:  c.qualify  / iterations,
      pTop8:     c.top8     / iterations,
      pFinal:    c.final    / iterations,
      pChampion: c.champion / iterations,
    };
  }
  return probs;
}

// Toma el 3° de cada grupo y los ordena según reglas FIFA de mejores terceros.
// Retorna array de 12 con propiedad `advancing: true` para los 8 mejores.
export function getRankedThirds(allGroupStandings, discipline = {}) {
  const thirds = Object.entries(allGroupStandings)
    .map(([group, standings]) => {
      const third = standings[2];
      if (!third) return null;
      const fixtures = FIXTURES_BY_GROUP[group] ?? [];
      const matchIds = fixtures.map(f => f.id);
      const fp = fairPlayPoints(third.code, matchIds, discipline);
      return { ...third, group, fp };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd  !== a.gd)  return b.gd  - a.gd;
      if (b.gf  !== a.gf)  return b.gf  - a.gf;
      if (b.fp  !== a.fp)  return b.fp  - a.fp;
      return a.code.localeCompare(b.code);
    });

  return thirds.map((t, i) => ({ ...t, advancing: i < 8 }));
}

// Resuelve un slot del bracket KO a un objeto de equipo {code, ...TEAMS[code]}.
// slotCode: '1A' (1°GrupoA), '2B', '3C', 'W73' (ganador P73), 'L101' (perdedor P101).
// Retorna null si el slot aún no está resuelto.
export function resolveKOSlot(slotCode, allGroupStandings, koResults) {
  if (!slotCode) return null;

  // Posición en grupo: '1A', '2B', '3C'
  const posMatch = slotCode.match(/^([123])([A-L])$/);
  if (posMatch) {
    const pos   = parseInt(posMatch[1]) - 1;
    const group = posMatch[2];
    const st    = allGroupStandings[group];
    if (!st || !st[pos]) return null;
    const code = st[pos].code;
    return code ? { code, ...TEAMS[code] } : null;
  }

  // Ganador de partido KO: 'W73'
  const winMatch = slotCode.match(/^W(\d+)$/);
  if (winMatch) {
    const id      = parseInt(winMatch[1]);
    const fixture = KO_FIXTURE_BY_ID[id];
    const result  = koResults[String(id)];
    if (!fixture || !result?.played) return null;
    const home = resolveKOSlot(fixture.home, allGroupStandings, koResults);
    const away = resolveKOSlot(fixture.away, allGroupStandings, koResults);
    if (!home || !away) return null;
    return result.homeScore > result.awayScore ? home : away;
  }

  // Perdedor de partido KO: 'L101' (para el 3er lugar)
  const loseMatch = slotCode.match(/^L(\d+)$/);
  if (loseMatch) {
    const id      = parseInt(loseMatch[1]);
    const fixture = KO_FIXTURE_BY_ID[id];
    const result  = koResults[String(id)];
    if (!fixture || !result?.played) return null;
    const home = resolveKOSlot(fixture.home, allGroupStandings, koResults);
    const away = resolveKOSlot(fixture.away, allGroupStandings, koResults);
    if (!home || !away) return null;
    return result.homeScore > result.awayScore ? away : home;
  }

  return null;
}
