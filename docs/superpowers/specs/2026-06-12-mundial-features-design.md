# Diseño: Expansión de funcionalidades — Mundial Tracker

**Fecha:** 2026-06-12  
**Alcance:** Nivel básico (estadísticas por equipo, no por jugador individual)  
**Enfoque de implementación:** C — Por niveles de dependencia

---

## Contexto

La app actual cubre solo la fase de grupos (72 partidos). Se agregan 6 funcionalidades nuevas para cubrir el torneo completo, en el orden dictado por sus dependencias.

---

## Funcionalidades y orden de implementación

| Nivel | Feature | Depende de |
|---|---|---|
| 1 | Predicciones IA estáticas | — |
| 1 | Squads completos | — |
| 2 | Desempate Fair Play | discipline en Firebase |
| 2 | Tabla de mejores terceros | Fair Play (standings completos) |
| 3 | Fase eliminatoria completa | Terceros clasificados |
| 3 | Escenarios hipotéticos | Standings completos |

---

## Sección 1: Datos y Firebase

### Archivos nuevos en `src/data/`

#### `ko-fixtures.js`
32 partidos de fase KO (partidos 73–104 del calendario oficial FIFA 2026).

Estructura de cada partido:
```js
{
  id: 73,
  round: 'R32',           // R32 | R16 | QF | SF | F | 3rd
  date: '2026-06-28',
  time: '13:00',
  stadium: 'SoFi Stadium',
  city: 'Los Ángeles',
  home: '2A',             // código posición-grupo o 'W73' (ganador partido 73)
  away: '2B'
}
```

Códigos de slot:
- `"1A"` → 1° del Grupo A
- `"2B"` → 2° del Grupo B
- `"3H"` → 3° del Grupo H (si clasifica entre los mejores)
- `"W73"` → Ganador del partido 73

#### `squads.js`
48 equipos × 26 jugadores. Fuente: convocatorias oficiales + Excel Mundial_FIFA_2026_v2_86.

Estructura:
```js
{
  MEX: {
    coach: 'Javier Aguirre',
    players: [
      { num: 1, name: 'RANGEL Raul', pos: 'POR', age: 26, club: 'CD Guadalajara' },
      // ... 25 más
    ]
  },
  // ... 47 equipos más
}
```

Posiciones válidas: `POR`, `DEF`, `MED`, `DEL`.

#### `static-predictions.js`
Snapshot de 10,000 simulaciones Elo+Poisson del 4-jun-2026 (tomado del Excel). No cambia con los resultados reales.

Estructura:
```js
{
  MEX: { pR32: 0.863, pQF: 0.510, pSF: 0.246, pFinal: 0.111, pChampion: 0.047, elo: 1867 },
  ESP: { pR32: 0.95,  pQF: 0.72,  pSF: 0.51,  pFinal: 0.34,  pChampion: 0.19,  elo: 2048 },
  // ... 46 equipos más
}
```

Podio predicho: 🥇 España — 🥈 Argentina — 🥉 Francia.

---

### Firebase — Schema actualizado

```json
{
  "results": {
    "MEX_KOR": { "homeScore": 2, "awayScore": 1, "played": true }
  },
  "ko_results": {
    "73": { "homeScore": 2, "awayScore": 0, "played": true }
  },
  "discipline": {
    "MEX_1":  { "yellow": 1, "red": 0 },
    "ZAF_1":  { "yellow": 2, "red": 1 }
  }
}
```

- `discipline` usa la clave `{TEAM_CODE}_{MATCH_ID}` donde `MATCH_ID` es el número de partido oficial (1–104).
- `App.jsx` agrega listeners `onValue` para `ko_results` y `discipline`, distribuyendo ambos por `AppCtx`.

---

## Sección 2: Páginas y Navegación

### Rutas nuevas
```
/eliminatoria  →  src/pages/Eliminatoria.jsx   (pública)
/squads        →  src/pages/Squads.jsx          (pública)
```

### Navbar actualizado
```
Home | México | Grupos | Eliminatoria | Squads | Admin
```

### Página: `Eliminatoria.jsx`

Bracket visual horizontal de 7 rondas:
- Columnas: 16avos → Octavos → Cuartos → Semifinal → Final + 3er Lugar
- Cada partido: card con equipos (flag + nombre), marcador si está jugado, fecha y estadio
- Slots vacíos: muestran el código resuelto (`"1° Grupo A"`) o `"Pendiente"` si el slot anterior no se ha definido
- México resaltado en verde donde aparezca
- Scroll horizontal en móvil
- No captura resultados (eso va en Admin)

### Página: `Squads.jsx`

- Barra de búsqueda: filtra por nombre de equipo o nombre de jugador en tiempo real
- 48 chips de equipos organizados por grupo (A-L), México destacado en verde
- Al seleccionar un equipo: tabla con columnas `#`, `Pos`, `Jugador`, `Edad`, `Club`
- Filas agrupadas por posición: POR → DEF → MED → DEL

### Página actualizada: `Grupos.jsx`

Tres tabs:

| Tab | Contenido |
|---|---|
| **Tablas** | 12 grupos con posiciones, como hoy |
| **Terceros** | Ranking de 12 terceros; top 8 marcados como clasificados con badge verde |
| **Escenarios** | Selector de grupo + inputs hipotéticos para jornada activa |

### Página actualizada: `Home.jsx`

Nueva sección al final de la página:

- Título: "Predicciones IA — Baseline Elo (4-jun-2026)"
- Lista Top 10 con probabilidades de campeón (valores estáticos de `static-predictions.js`)
- Nota aclaratoria: "Este ranking es el punto de partida del modelo y no cambia con los resultados"

### Página actualizada: `Admin.jsx`

Dos tabs:

| Tab | Contenido |
|---|---|
| **Resultados** | Selector de fase (Grupos / 16avos / Octavos / Cuartos / Semifinal / Final). En Grupos: flujo actual sin cambios. En fases KO: lista de partidos de esa ronda con los equipos resueltos y inputs de marcador local/visitante. |
| **Disciplina** | Selector de partido + inputs de tarjetas |

---

## Sección 3: Algoritmos (`src/model/simulation.js`)

### 1. Fair Play en standings de grupo

`getCurrentStandings` agrega Fair Play como 5° criterio de desempate.

Puntos Fair Play (estándar FIFA):
| Tarjeta | Puntos |
|---|---|
| Amarilla | -1 |
| Roja directa | -3 |

Criterios de desempate en orden:
```
Pts → DG → GF → H2H (Pts → DG → GF) → Fair Play → índice interno
```

Fair Play acumula todos los partidos del equipo en el grupo. Menor puntuación negativa = mejor Fair Play.

### 2. Tabla de mejores terceros

Nueva función `getRankedThirds(allGroupStandings)`:
1. Extrae el 3° clasificado de cada uno de los 12 grupos
2. Ordena por: `Pts → DG → GF → FairPlay`
3. Retorna array de 12 equipos; los índices 0–7 son los clasificados

> La asignación exacta de terceros a partidos de 16avos (matriz Anexo C FIFA, 495 combinaciones) queda fuera del alcance de esta versión. Los slots del bracket muestran "Mejor 3° de [grupos posibles]" hasta que el admin capture el ganador real.

### 3. Resolución de slots KO

Nueva función `resolveKOSlot(slotCode, groupResults, koResults, allStandings)`:

- `"1A"` → busca en `allStandings.A[0]`
- `"2B"` → busca en `allStandings.B[1]`
- `"3H"` → busca en `getRankedThirds()[...]` si el grupo H está en top 8
- `"W73"` → busca en `koResults["73"]` y retorna el equipo ganador
- Retorna `{ code, name, flag }` o `null` si aún no hay resultado

---

## Sección 4: Admin — Tab Disciplina

### Flujo de captura

1. Selector de fase: Grupos / 16avos / Octavos / Cuartos / Semifinal / Final
2. Selector de partido: lista de partidos de esa fase con fecha y equipos
3. Inputs por equipo local y visitante:

```
Partido 1 · México vs Sudáfrica · 11/jun

              México     Sudáfrica
🟡 Amarillas    [_]         [_]
🔴 Rojas        [_]         [_]

                    [Guardar]  [Borrar]
```

- Guardar escribe en Firebase: `discipline/MEX_1` y `discipline/ZAF_1`
- Si ya hay datos, los inputs aparecen pre-cargados
- Botón "Borrar" disponible cuando hay datos guardados

---

## Archivos afectados

### Creados
- `src/data/ko-fixtures.js`
- `src/data/squads.js`
- `src/data/static-predictions.js`
- `src/pages/Eliminatoria.jsx`
- `src/pages/Squads.jsx`

### Modificados
- `src/App.jsx` — rutas + listeners Firebase + contexto
- `src/pages/Home.jsx` — sección Predicciones IA
- `src/pages/Grupos.jsx` — tabs + Terceros + Escenarios
- `src/pages/Admin.jsx` — tab Disciplina + admin KO
- `src/model/simulation.js` — Fair Play + terceros + resolución KO

---

## Fuera de alcance (versión básica)

- Estadísticas individuales de jugadores (goles, asistencias, minutos)
- Alineaciones y formaciones
- Asignación automática de terceros a partidos específicos (matriz Anexo C FIFA)
- Tipos detallados de tarjeta (2ª amarilla, amarilla+roja)
- Snapshots del estado del torneo
