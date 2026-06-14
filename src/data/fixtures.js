import { GROUPS } from './teams';

// Jornadas del Mundial 2026 (fase de grupos: 11 jun - 27 jun)
// Fechas aproximadas por grupo
const GROUP_DATES = {
  A: ['2026-06-11', '2026-06-18', '2026-06-24'],
  B: ['2026-06-12', '2026-06-18', '2026-06-24'],
  C: ['2026-06-13', '2026-06-19', '2026-06-24'],
  D: ['2026-06-12', '2026-06-19', '2026-06-25'],
  E: ['2026-06-14', '2026-06-20', '2026-06-25'],
  F: ['2026-06-14', '2026-06-20', '2026-06-25'],
  G: ['2026-06-15', '2026-06-21', '2026-06-26'],
  H: ['2026-06-15', '2026-06-21', '2026-06-26'],
  I: ['2026-06-16', '2026-06-22', '2026-06-26'],
  J: ['2026-06-16', '2026-06-22', '2026-06-27'],
  K: ['2026-06-17', '2026-06-23', '2026-06-27'],
  L: ['2026-06-17', '2026-06-23', '2026-06-27'],
};

// Formato estándar FIFA para 4 equipos:
// MD1: T1vT2, T3vT4
// MD2: T1vT3, T2vT4
// MD3: T1vT4, T2vT3 (simultáneos)
function makeGroupFixtures(group, [T1, T2, T3, T4]) {
  const dates = GROUP_DATES[group];
  return [
    { id: `${T1}_${T2}`, home: T1, away: T2, group, matchday: 1, date: dates[0] },
    { id: `${T3}_${T4}`, home: T3, away: T4, group, matchday: 1, date: dates[0] },
    { id: `${T1}_${T3}`, home: T1, away: T3, group, matchday: 2, date: dates[1] },
    { id: `${T2}_${T4}`, home: T2, away: T4, group, matchday: 2, date: dates[1] },
    { id: `${T1}_${T4}`, home: T1, away: T4, group, matchday: 3, date: dates[2] },
    { id: `${T2}_${T3}`, home: T2, away: T3, group, matchday: 3, date: dates[2] },
  ];
}

export const FIXTURES = Object.entries(GROUPS).flatMap(([group, teams]) =>
  makeGroupFixtures(group, teams)
);

export const FIXTURE_BY_ID = Object.fromEntries(FIXTURES.map(f => [f.id, f]));

export const FIXTURES_BY_GROUP = Object.fromEntries(
  Object.keys(GROUPS).map(g => [g, FIXTURES.filter(f => f.group === g)])
);

export const FIXTURES_BY_TEAM = {};
FIXTURES.forEach(f => {
  if (!FIXTURES_BY_TEAM[f.home]) FIXTURES_BY_TEAM[f.home] = [];
  if (!FIXTURES_BY_TEAM[f.away]) FIXTURES_BY_TEAM[f.away] = [];
  FIXTURES_BY_TEAM[f.home].push(f);
  FIXTURES_BY_TEAM[f.away].push(f);
});
