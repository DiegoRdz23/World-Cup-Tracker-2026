// Partidos de fase eliminatoria — Copa Mundial FIFA 2026
// home/away: códigos de posición ('1A'=1°GrupoA, '2B'=2°GrupoB, 'W73'=GanadorP73, 'L101'=PerdedorP101)
export const KO_FIXTURES = [
  // ── 16avos de final ────────────────────────────────────────────────────────
  { id: 73,  round: 'R32', date: '2026-06-28', time: '13:00', stadium: 'SoFi Stadium',              city: 'Los Ángeles',        home: '2A',  away: '2B'  },
  { id: 74,  round: 'R32', date: '2026-06-29', time: '14:30', stadium: 'Gillette Stadium',           city: 'Boston',             home: '1E',  away: '3C'  },
  { id: 75,  round: 'R32', date: '2026-06-29', time: '19:00', stadium: 'Estadio BBVA',               city: 'Monterrey',          home: '1F',  away: '2C'  },
  { id: 76,  round: 'R32', date: '2026-06-29', time: '11:00', stadium: 'NRG Stadium',                city: 'Houston',            home: '1C',  away: '2F'  },
  { id: 77,  round: 'R32', date: '2026-06-30', time: '15:00', stadium: 'MetLife Stadium',            city: 'Nueva York/NJ',      home: '1I',  away: '3F'  },
  { id: 78,  round: 'R32', date: '2026-06-30', time: '11:00', stadium: 'AT&T Stadium',               city: 'Dallas',             home: '2E',  away: '2I'  },
  { id: 79,  round: 'R32', date: '2026-06-30', time: '19:00', stadium: 'Estadio Azteca',             city: 'Ciudad de México',   home: '1A',  away: '3H'  },
  { id: 80,  round: 'R32', date: '2026-07-01', time: '10:00', stadium: 'Mercedes-Benz Stadium',      city: 'Atlanta',            home: '1L',  away: '3E'  },
  { id: 81,  round: 'R32', date: '2026-07-01', time: '18:00', stadium: "Levi's Stadium",             city: 'San Francisco',      home: '1D',  away: '3B'  },
  { id: 82,  round: 'R32', date: '2026-07-01', time: '14:00', stadium: 'Lumen Field',                city: 'Seattle',            home: '1G',  away: '3A'  },
  { id: 83,  round: 'R32', date: '2026-07-02', time: '17:00', stadium: 'BMO Field',                  city: 'Toronto',            home: '2K',  away: '2L'  },
  { id: 84,  round: 'R32', date: '2026-07-02', time: '13:00', stadium: 'SoFi Stadium',               city: 'Los Ángeles',        home: '1H',  away: '2J'  },
  { id: 85,  round: 'R32', date: '2026-07-02', time: '21:00', stadium: 'BC Place',                   city: 'Vancouver',          home: '1B',  away: '3G'  },
  { id: 86,  round: 'R32', date: '2026-07-03', time: '16:00', stadium: 'Hard Rock Stadium',          city: 'Miami',              home: '1J',  away: '2H'  },
  { id: 87,  round: 'R32', date: '2026-07-03', time: '19:30', stadium: 'Arrowhead Stadium',          city: 'Kansas City',        home: '1K',  away: '3D'  },
  { id: 88,  round: 'R32', date: '2026-07-03', time: '12:00', stadium: 'AT&T Stadium',               city: 'Dallas',             home: '2D',  away: '2G'  },
  // ── Octavos de final ───────────────────────────────────────────────────────
  { id: 89,  round: 'R16', date: '2026-07-04', time: '15:00', stadium: 'Lincoln Financial Field',    city: 'Filadelfia',         home: 'W74', away: 'W77' },
  { id: 90,  round: 'R16', date: '2026-07-04', time: '11:00', stadium: 'NRG Stadium',                city: 'Houston',            home: 'W73', away: 'W75' },
  { id: 91,  round: 'R16', date: '2026-07-05', time: '14:00', stadium: 'MetLife Stadium',            city: 'Nueva York/NJ',      home: 'W76', away: 'W78' },
  { id: 92,  round: 'R16', date: '2026-07-05', time: '18:00', stadium: 'Estadio Azteca',             city: 'Ciudad de México',   home: 'W79', away: 'W80' },
  { id: 93,  round: 'R16', date: '2026-07-06', time: '13:00', stadium: 'AT&T Stadium',               city: 'Dallas',             home: 'W83', away: 'W84' },
  { id: 94,  round: 'R16', date: '2026-07-06', time: '18:00', stadium: 'Lumen Field',                city: 'Seattle',            home: 'W81', away: 'W82' },
  { id: 95,  round: 'R16', date: '2026-07-07', time: '10:00', stadium: 'Mercedes-Benz Stadium',      city: 'Atlanta',            home: 'W86', away: 'W88' },
  { id: 96,  round: 'R16', date: '2026-07-07', time: '14:00', stadium: 'BC Place',                   city: 'Vancouver',          home: 'W85', away: 'W87' },
  // ── Cuartos de final ───────────────────────────────────────────────────────
  { id: 97,  round: 'QF',  date: '2026-07-09', time: '14:00', stadium: 'Gillette Stadium',           city: 'Boston',             home: 'W89', away: 'W90' },
  { id: 98,  round: 'QF',  date: '2026-07-10', time: '13:00', stadium: 'SoFi Stadium',               city: 'Los Ángeles',        home: 'W93', away: 'W94' },
  { id: 99,  round: 'QF',  date: '2026-07-11', time: '15:00', stadium: 'Hard Rock Stadium',          city: 'Miami',              home: 'W91', away: 'W92' },
  { id: 100, round: 'QF',  date: '2026-07-11', time: '19:00', stadium: 'Arrowhead Stadium',          city: 'Kansas City',        home: 'W95', away: 'W96' },
  // ── Semifinales ────────────────────────────────────────────────────────────
  { id: 101, round: 'SF',  date: '2026-07-14', time: '13:00', stadium: 'AT&T Stadium',               city: 'Dallas',             home: 'W97', away: 'W98'  },
  { id: 102, round: 'SF',  date: '2026-07-15', time: '13:00', stadium: 'Mercedes-Benz Stadium',      city: 'Atlanta',            home: 'W99', away: 'W100' },
  // ── Tercer lugar ───────────────────────────────────────────────────────────
  { id: 103, round: '3rd', date: '2026-07-18', time: '15:00', stadium: 'Hard Rock Stadium',          city: 'Miami',              home: 'L101', away: 'L102' },
  // ── Final ──────────────────────────────────────────────────────────────────
  { id: 104, round: 'F',   date: '2026-07-19', time: '13:00', stadium: 'MetLife Stadium',            city: 'Nueva York/NJ',      home: 'W101', away: 'W102' },
];

export const KO_FIXTURE_BY_ID = Object.fromEntries(KO_FIXTURES.map(f => [f.id, f]));
