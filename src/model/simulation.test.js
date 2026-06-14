import { describe, test, expect } from 'vitest';
import { fairPlayPoints, getRankedThirds, resolveKOSlot } from './simulation';

describe('fairPlayPoints', () => {
  test('retorna 0 sin tarjetas', () => {
    expect(fairPlayPoints('MEX', [1, 28], {})).toBe(0);
  });

  test('descuenta 1 por amarilla', () => {
    const discipline = { 'MEX_1': { yellow: 2, red: 0 } };
    expect(fairPlayPoints('MEX', [1], discipline)).toBe(-2);
  });

  test('descuenta 3 por roja', () => {
    const discipline = { 'MEX_1': { yellow: 0, red: 1 } };
    expect(fairPlayPoints('MEX', [1], discipline)).toBe(-3);
  });

  test('acumula múltiples partidos', () => {
    const discipline = {
      'MEX_1':  { yellow: 2, red: 0 },
      'MEX_28': { yellow: 1, red: 1 },
    };
    expect(fairPlayPoints('MEX', [1, 28], discipline)).toBe(-2 - 1 - 3);
  });
});

describe('getRankedThirds', () => {
  const makeStandings = (thirds) =>
    Object.fromEntries(
      'ABCDEFGHIJKL'.split('').map((g, i) => [
        g,
        [
          { code: `T1${g}`, pts: 9, gd: 5, gf: 7 },
          { code: `T2${g}`, pts: 6, gd: 2, gf: 4 },
          thirds[i] ?? { code: `T3${g}`, pts: 0, gd: -5, gf: 0 },
        ],
      ])
    );

  test('devuelve 12 terceros', () => {
    const standings = makeStandings([]);
    const result = getRankedThirds(standings);
    expect(result).toHaveLength(12);
  });

  test('los primeros 8 tienen advancing=true', () => {
    const standings = makeStandings([]);
    const result = getRankedThirds(standings);
    expect(result.slice(0, 8).every(t => t.advancing)).toBe(true);
    expect(result.slice(8).every(t => !t.advancing)).toBe(true);
  });

  test('ordena por pts desc', () => {
    const thirds = [
      { code: 'BEST', pts: 7, gd: 3, gf: 5 },
      ...Array(11).fill(null),
    ];
    const standings = makeStandings(thirds);
    const result = getRankedThirds(standings);
    expect(result[0].code).toBe('BEST');
  });
});

import { resolveKOSlot } from './simulation';

describe('resolveKOSlot', () => {
  const standings = {
    A: [{ code: 'MEX', pts: 9 }, { code: 'KOR', pts: 6 }, { code: 'CZE', pts: 3 }, { code: 'RSA', pts: 0 }],
    B: [{ code: 'SUI', pts: 9 }, { code: 'CAN', pts: 6 }, { code: 'BIH', pts: 3 }, { code: 'QAT', pts: 0 }],
  };

  test('resuelve código de posición 1A', () => {
    const result = resolveKOSlot('1A', standings, {});
    expect(result?.code).toBe('MEX');
  });

  test('resuelve código de posición 2B', () => {
    const result = resolveKOSlot('2B', standings, {});
    expect(result?.code).toBe('CAN');
  });

  test('retorna null si el grupo no tiene standings suficientes', () => {
    const result = resolveKOSlot('3C', standings, {});
    expect(result).toBeNull();
  });

  test('retorna null si el partido KO no está jugado', () => {
    const result = resolveKOSlot('W73', standings, {});
    expect(result).toBeNull();
  });

  test('resuelve ganador de partido KO jugado', () => {
    // Partido 73: 2A (KOR) vs 2B (CAN) → KOR gana 2-1
    const koResults = { '73': { homeScore: 2, awayScore: 1, played: true } };
    const result = resolveKOSlot('W73', standings, koResults);
    expect(result?.code).toBe('KOR');
  });
});
