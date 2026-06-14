import { describe, test, expect } from 'vitest';
import { fairPlayPoints } from './simulation';

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
