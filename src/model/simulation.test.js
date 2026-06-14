import { describe, test, expect } from 'vitest';
import { fairPlayPoints, getRankedThirds } from './simulation';

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
