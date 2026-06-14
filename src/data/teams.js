// Ratings basados en ranking FIFA junio 2026
export const TEAMS = {
  // GRUPO A
  MEX: { code: 'MEX', name: 'México',          flag: '🇲🇽', rating: 1681, group: 'A' },
  KOR: { code: 'KOR', name: 'Corea del Sur',   flag: '🇰🇷', rating: 1588, group: 'A' },
  CZE: { code: 'CZE', name: 'Chequia',         flag: '🇨🇿', rating: 1500, group: 'A' },
  RSA: { code: 'RSA', name: 'Sudáfrica',       flag: '🇿🇦', rating: 1490, group: 'A' },

  // GRUPO B
  SUI: { code: 'SUI', name: 'Suiza',           flag: '🇨🇭', rating: 1649, group: 'B' },
  QAT: { code: 'QAT', name: 'Qatar',           flag: '🇶🇦', rating: 1505, group: 'B' },
  CAN: { code: 'CAN', name: 'Canadá',          flag: '🇨🇦', rating: 1556, group: 'B' },
  BIH: { code: 'BIH', name: 'Bosnia',          flag: '🇧🇦', rating: 1520, group: 'B' },

  // GRUPO C
  BRA: { code: 'BRA', name: 'Brasil',          flag: '🇧🇷', rating: 1761, group: 'C' },
  MAR: { code: 'MAR', name: 'Marruecos',       flag: '🇲🇦', rating: 1755, group: 'C' },
  SCO: { code: 'SCO', name: 'Escocia',         flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', rating: 1540, group: 'C' },
  HAI: { code: 'HAI', name: 'Haití',           flag: '🇭🇹', rating: 1380, group: 'C' },

  // GRUPO D
  USA: { code: 'USA', name: 'EE. UU.',         flag: '🇺🇸', rating: 1673, group: 'D' },
  TUR: { code: 'TUR', name: 'Turquía',         flag: '🇹🇷', rating: 1599, group: 'D' },
  AUS: { code: 'AUS', name: 'Australia',       flag: '🇦🇺', rating: 1580, group: 'D' },
  PAR: { code: 'PAR', name: 'Paraguay',        flag: '🇵🇾', rating: 1515, group: 'D' },

  // GRUPO E
  GER: { code: 'GER', name: 'Alemania',        flag: '🇩🇪', rating: 1730, group: 'E' },
  ECU: { code: 'ECU', name: 'Ecuador',         flag: '🇪🇨', rating: 1594, group: 'E' },
  CIV: { code: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮', rating: 1528, group: 'E' },
  CUR: { code: 'CUR', name: 'Curazao',         flag: '🇨🇼', rating: 1350, group: 'E' },

  // GRUPO F
  NED: { code: 'NED', name: 'Países Bajos',    flag: '🇳🇱', rating: 1757, group: 'F' },
  JPN: { code: 'JPN', name: 'Japón',           flag: '🇯🇵', rating: 1660, group: 'F' },
  SWE: { code: 'SWE', name: 'Suecia',          flag: '🇸🇪', rating: 1548, group: 'F' },
  TUN: { code: 'TUN', name: 'Túnez',           flag: '🇹🇳', rating: 1545, group: 'F' },

  // GRUPO G
  BEL: { code: 'BEL', name: 'Bélgica',         flag: '🇧🇪', rating: 1734, group: 'G' },
  IRN: { code: 'IRN', name: 'Irán',            flag: '🇮🇷', rating: 1615, group: 'G' },
  EGY: { code: 'EGY', name: 'Egipto',          flag: '🇪🇬', rating: 1563, group: 'G' },
  NZL: { code: 'NZL', name: 'Nueva Zelanda',   flag: '🇳🇿', rating: 1420, group: 'G' },

  // GRUPO H
  ESP: { code: 'ESP', name: 'España',          flag: '🇪🇸', rating: 1873, group: 'H' },
  URU: { code: 'URU', name: 'Uruguay',         flag: '🇺🇾', rating: 1673, group: 'H' },
  KSA: { code: 'KSA', name: 'Arabia Saudita',  flag: '🇸🇦', rating: 1510, group: 'H' },
  CPV: { code: 'CPV', name: 'Cabo Verde',      flag: '🇨🇻', rating: 1410, group: 'H' },

  // GRUPO I
  FRA: { code: 'FRA', name: 'Francia',         flag: '🇫🇷', rating: 1877, group: 'I' },
  SEN: { code: 'SEN', name: 'Senegal',         flag: '🇸🇳', rating: 1688, group: 'I' },
  NOR: { code: 'NOR', name: 'Noruega',         flag: '🇳🇴', rating: 1550, group: 'I' },
  IRQ: { code: 'IRQ', name: 'Iraq',            flag: '🇮🇶', rating: 1450, group: 'I' },

  // GRUPO J
  ARG: { code: 'ARG', name: 'Argentina',       flag: '🇦🇷', rating: 1874, group: 'J' },
  AUT: { code: 'AUT', name: 'Austria',         flag: '🇦🇹', rating: 1593, group: 'J' },
  ALG: { code: 'ALG', name: 'Argelia',         flag: '🇩🇿', rating: 1564, group: 'J' },
  JOR: { code: 'JOR', name: 'Jordania',        flag: '🇯🇴', rating: 1455, group: 'J' },

  // GRUPO K
  POR: { code: 'POR', name: 'Portugal',        flag: '🇵🇹', rating: 1763, group: 'K' },
  COL: { code: 'COL', name: 'Colombia',        flag: '🇨🇴', rating: 1693, group: 'K' },
  COD: { code: 'COD', name: 'RD Congo',        flag: '🇨🇩', rating: 1478, group: 'K' },
  UZB: { code: 'UZB', name: 'Uzbekistán',      flag: '🇺🇿', rating: 1465, group: 'K' },

  // GRUPO L
  ENG: { code: 'ENG', name: 'Inglaterra',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', rating: 1825, group: 'L' },
  CRO: { code: 'CRO', name: 'Croacia',         flag: '🇭🇷', rating: 1717, group: 'L' },
  GHA: { code: 'GHA', name: 'Ghana',           flag: '🇬🇭', rating: 1485, group: 'L' },
  PAN: { code: 'PAN', name: 'Panamá',          flag: '🇵🇦', rating: 1472, group: 'L' },
};

// Orden según calendario oficial FIFA 2026: [T1,T2] juegan J1, [T3,T4] juegan J1
// MD1: T1vT2, T3vT4 · MD2: T1vT3, T2vT4 · MD3: T1vT4, T2vT3
export const GROUPS = {
  A: ['MEX', 'RSA', 'KOR', 'CZE'],
  B: ['CAN', 'BIH', 'QAT', 'SUI'],
  C: ['BRA', 'MAR', 'HAI', 'SCO'],
  D: ['USA', 'PAR', 'AUS', 'TUR'],
  E: ['GER', 'CUR', 'CIV', 'ECU'],
  F: ['NED', 'JPN', 'SWE', 'TUN'],
  G: ['BEL', 'EGY', 'IRN', 'NZL'],
  H: ['ESP', 'CPV', 'KSA', 'URU'],
  I: ['FRA', 'SEN', 'IRQ', 'NOR'],
  J: ['ARG', 'ALG', 'AUT', 'JOR'],
  K: ['POR', 'COD', 'UZB', 'COL'],
  L: ['ENG', 'CRO', 'GHA', 'PAN'],
};

// Los favoritos a mostrar en Home (por rating desc)
export const TOP_CONTENDERS = ['FRA', 'ESP', 'ARG', 'ENG', 'POR', 'BRA', 'NED', 'BEL', 'GER', 'MEX'];
