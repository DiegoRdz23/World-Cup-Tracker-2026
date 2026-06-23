# Diseño: Página /partidos con tabla de Poisson

**Fecha:** 2026-06-23  
**Estado:** Aprobado

---

## Objetivo

Agregar una nueva página `/partidos` al tracker que muestre todos los partidos de la fase de grupos. Cada partido puede verse en detalle con una tabla de Poisson que muestra la distribución de resultados probables antes del partido, y el resultado real resaltado en la matriz después de jugarse.

---

## Arquitectura

### Archivos nuevos
- `src/pages/Partidos.jsx` — página principal con vista lista y vista detalle

### Archivos modificados
- `src/model/simulation.js` — agregar función `getScoreMatrix`
- `src/App.jsx` — agregar ruta `/partidos` y entrada en el nav

---

## Funcionalidad

### Vista lista

- Todos los partidos de fase de grupos, agrupados por fecha (ordenados cronológicamente)
- Cada card muestra:
  - Banderas y nombres de ambos equipos
  - Grupo y jornada
  - **Si no jugado:** goles esperados `λH – λA` calculados con el modelo actual
  - **Si jugado:** marcador real con color (verde = ganó local, rojo = perdió local, gris = empate)
- Al hacer clic en cualquier card se pasa a vista detalle

### Vista detalle

Encabezado:
- Botón `← Partidos` para regresar
- Nombres de equipos, grupo y fecha

Sección de probabilidades:
- Tres ProbBars etiquetadas: "Local gana X%", "Empate X%", "Visitante gana X%"
- Goles esperados de cada equipo (λ)

Matriz de resultados (6×6, goles 0–5):
- Filas = goles del local, columnas = goles del visitante
- Cada celda muestra el porcentaje de probabilidad: `poissonPMF(i, λH) * poissonPMF(j, λA)`
- Celda más probable: borde azul destacado
- Zona local gana (i > j): fondo azul muy sutil
- Zona empate (i == j): fondo gris muy sutil  
- Zona visitante gana (i < j): fondo rojo muy sutil
- **Si el partido ya se jugó:** la celda del marcador real tiene borde verde + ícono `✓` + tag con "Este resultado tenía X% de probabilidad"

### Navegación

- Nueva entrada en el nav: `{ to: '/partidos', label: 'Partidos' }`
- Sin sub-rutas. Estado local `selectedMatch` (null = lista, fixture object = detalle)

---

## Modelo: `getScoreMatrix`

Nueva función en `simulation.js`:

```js
// Retorna matriz [7][7] de probabilidades para scores 0-6
export function getScoreMatrix(homeCode, awayCode) {
  const { lH, lA } = getMatchProbs(homeCode, awayCode);
  const SIZE = 6; // 0 a 5 goles
  const matrix = [];
  for (let i = 0; i <= SIZE; i++) {
    matrix[i] = [];
    for (let j = 0; j <= SIZE; j++) {
      matrix[i][j] = poissonPMF(i, lH) * poissonPMF(j, lA);
    }
  }
  return { matrix, lH, lA };
}
```

`getMatchProbs` ya existe y ya calcula `lH`, `lA`, `win`, `draw`, `lose`. Solo se expone `getScoreMatrix` como wrapper adicional.

---

## Constraints

- No se necesita nueva fuente de datos: todo se calcula con los ratings FIFA ya cargados en `TEAMS`
- Los resultados reales vienen de `results` en el contexto global (`useApp`)
- La matriz es siempre la predicción pre-partido (basada en ratings), no se recalcula post-partido
- El tamaño de la matriz es fijo 6×6 (0–5 goles). Cubre >99% de la distribución de Poisson con λ ≤ 3

---

## Estilo

Seguir las convenciones visuales existentes del proyecto:
- Fuente display para encabezados, `font-mono` para números
- Colores del sistema: `#1C2E42` text, `#3674B5` blue, `#0A6E35` green, `#E05050` red
- Cards con clase `card` o `card2` existentes
- `ProbBar` para las tres probabilidades principales
