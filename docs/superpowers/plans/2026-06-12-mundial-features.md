# Mundial Tracker — Feature Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar fase eliminatoria completa, tabla de mejores terceros, squads, desempate Fair Play, escenarios hipotéticos y predicciones IA estáticas al mundial-tracker.

**Architecture:** Enfoque C por niveles de dependencia — Nivel 1 (datos independientes), Nivel 2 (Fair Play + Terceros), Nivel 3 (Eliminatoria + Escenarios). Cada nivel construye sobre el anterior. Los nuevos datos se almacenan en Firebase (ko_results, discipline) y en archivos estáticos (squads, ko-fixtures, static-predictions).

**Tech Stack:** React 18, Vite 5, Firebase Realtime DB, Tailwind CSS, Vitest (se agrega en Task 1)

---

## Mapa de archivos

| Acción | Archivo |
|---|---|
| Crear | `src/data/static-predictions.js` |
| Crear | `src/data/squads.js` |
| Crear | `src/data/ko-fixtures.js` |
| Crear | `src/pages/Squads.jsx` |
| Crear | `src/pages/Eliminatoria.jsx` |
| Crear | `src/model/simulation.test.js` |
| Modificar | `src/model/simulation.js` |
| Modificar | `src/App.jsx` |
| Modificar | `src/pages/Home.jsx` |
| Modificar | `src/pages/Groups.jsx` |
| Modificar | `src/pages/Admin.jsx` |
| Modificar | `package.json` |
| Modificar | `vite.config.js` |

---

## NIVEL 1 — Sin dependencias externas

---

### Task 1: Setup Vitest

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Instalar vitest**

```bash
npm install -D vitest
```

- [ ] **Agregar script de test en `package.json`**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Configurar `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
})
```

- [ ] **Verificar que vitest corre sin errores**

```bash
npm test
```

Resultado esperado: `No test files found` (sin error de configuración).

- [ ] **Commit**

```bash
git add package.json vite.config.js
git commit -m "chore: add vitest for algorithm testing"
```

---

### Task 2: Crear `src/data/static-predictions.js`

Snapshot del modelo Elo+Poisson del Excel (4-jun-2026). No cambia con resultados reales.

**Files:**
- Create: `src/data/static-predictions.js`

- [ ] **Crear el archivo con datos de los 48 equipos**

```js
// Snapshot 10,000 simulaciones Elo+Poisson — 4-jun-2026
// Fuente: Excel Mundial_FIFA_2026_v2_86.xlsx, hoja "Predictor Monte Carlo"
// pR32=P(llegar a 16avos), pQF=P(cuartos), pSF=P(semis), pFinal=P(final), pChampion=P(campeón)
export const STATIC_PREDICTIONS = {
  ESP: { elo: 2165, pR32: 0.9776, pQF: 0.5117, pSF: 0.3820, pFinal: 0.2650, pChampion: 0.1720 },
  ARG: { elo: 2113, pR32: 0.9353, pQF: 0.4478, pSF: 0.3095, pFinal: 0.2015, pChampion: 0.1239 },
  FRA: { elo: 2081, pR32: 0.9151, pQF: 0.4396, pSF: 0.2898, pFinal: 0.1699, pChampion: 0.1049 },
  ENG: { elo: 2020, pR32: 0.9256, pQF: 0.3562, pSF: 0.2181, pFinal: 0.1241, pChampion: 0.0668 },
  BRA: { elo: 1988, pR32: 0.9063, pQF: 0.3303, pSF: 0.1877, pFinal: 0.0976, pChampion: 0.0490 },
  POR: { elo: 1984, pR32: 0.8585, pQF: 0.3044, pSF: 0.1674, pFinal: 0.0963, pChampion: 0.0469 },
  COL: { elo: 1977, pR32: 0.8511, pQF: 0.2913, pSF: 0.1592, pFinal: 0.0829, pChampion: 0.0417 },
  NED: { elo: 1944, pR32: 0.8529, pQF: 0.2931, pSF: 0.1550, pFinal: 0.0723, pChampion: 0.0380 },
  GER: { elo: 1925, pR32: 0.9023, pQF: 0.2578, pSF: 0.1368, pFinal: 0.0640, pChampion: 0.0314 },
  ECU: { elo: 1935, pR32: 0.9087, pQF: 0.2754, pSF: 0.1446, pFinal: 0.0684, pChampion: 0.0308 },
  SUI: { elo: 1894, pR32: 0.9246, pQF: 0.2894, pSF: 0.1299, pFinal: 0.0611, pChampion: 0.0275 },
  NOR: { elo: 1917, pR32: 0.7606, pQF: 0.2328, pSF: 0.1247, pFinal: 0.0605, pChampion: 0.0248 },
  TUR: { elo: 1906, pR32: 0.7991, pQF: 0.2599, pSF: 0.1188, pFinal: 0.0573, pChampion: 0.0245 },
  JPN: { elo: 1906, pR32: 0.8252, pQF: 0.2382, pSF: 0.1181, pFinal: 0.0500, pChampion: 0.0244 },
  CRO: { elo: 1908, pR32: 0.8479, pQF: 0.2300, pSF: 0.1174, pFinal: 0.0540, pChampion: 0.0231 },
  URU: { elo: 1892, pR32: 0.8380, pQF: 0.2165, pSF: 0.1112, pFinal: 0.0526, pChampion: 0.0223 },
  BEL: { elo: 1888, pR32: 0.8686, pQF: 0.2577, pSF: 0.1125, pFinal: 0.0526, pChampion: 0.0219 },
  MEX: { elo: 1867, pR32: 0.8627, pQF: 0.2458, pSF: 0.1105, pFinal: 0.0466, pChampion: 0.0194 },
  SEN: { elo: 1867, pR32: 0.7065, pQF: 0.1956, pSF: 0.0921, pFinal: 0.0382, pChampion: 0.0143 },
  PAR: { elo: 1832, pR32: 0.7180, pQF: 0.1770, pSF: 0.0721, pFinal: 0.0314, pChampion: 0.0121 },
  MAR: { elo: 1824, pR32: 0.7599, pQF: 0.1683, pSF: 0.0730, pFinal: 0.0285, pChampion: 0.0116 },
  AUT: { elo: 1830, pR32: 0.6861, pQF: 0.1355, pSF: 0.0604, pFinal: 0.0256, pChampion: 0.0090 },
  CAN: { elo: 1793, pR32: 0.8466, pQF: 0.1902, pSF: 0.0686, pFinal: 0.0269, pChampion: 0.0087 },
  SCO: { elo: 1770, pR32: 0.6870, pQF: 0.1273, pSF: 0.0492, pFinal: 0.0161, pChampion: 0.0058 },
  KOR: { elo: 1756, pR32: 0.7481, pQF: 0.1476, pSF: 0.0496, pFinal: 0.0176, pChampion: 0.0054 },
  AUS: { elo: 1774, pR32: 0.6294, pQF: 0.1240, pSF: 0.0471, pFinal: 0.0162, pChampion: 0.0054 },
  IRN: { elo: 1764, pR32: 0.7342, pQF: 0.1323, pSF: 0.0481, pFinal: 0.0167, pChampion: 0.0052 },
  CZE: { elo: 1733, pR32: 0.7046, pQF: 0.1327, pSF: 0.0438, pFinal: 0.0140, pChampion: 0.0045 },
  ALG: { elo: 1760, pR32: 0.5697, pQF: 0.0851, pSF: 0.0331, pFinal: 0.0130, pChampion: 0.0040 },
  PAN: { elo: 1733, pR32: 0.6217, pQF: 0.0961, pSF: 0.0340, pFinal: 0.0128, pChampion: 0.0037 },
  SWE: { elo: 1714, pR32: 0.5701, pQF: 0.0765, pSF: 0.0279, pFinal: 0.0076, pChampion: 0.0031 },
  EGY: { elo: 1699, pR32: 0.6576, pQF: 0.0961, pSF: 0.0280, pFinal: 0.0099, pChampion: 0.0024 },
  USA: { elo: 1733, pR32: 0.5674, pQF: 0.0927, pSF: 0.0337, pFinal: 0.0114, pChampion: 0.0023 },
  CIV: { elo: 1676, pR32: 0.6292, pQF: 0.0727, pSF: 0.0220, pFinal: 0.0071, pChampion: 0.0022 },
  COD: { elo: 1661, pR32: 0.4288, pQF: 0.0458, pSF: 0.0144, pFinal: 0.0036, pChampion: 0.0017 },
  UZB: { elo: 1718, pR32: 0.5266, pQF: 0.0712, pSF: 0.0246, pFinal: 0.0080, pChampion: 0.0017 },
  JOR: { elo: 1685, pR32: 0.4501, pQF: 0.0524, pSF: 0.0167, pFinal: 0.0043, pChampion: 0.0009 },
  TUN: { elo: 1633, pR32: 0.4319, pQF: 0.0419, pSF: 0.0123, pFinal: 0.0036, pChampion: 0.0008 },
  BIH: { elo: 1591, pR32: 0.5848, pQF: 0.0630, pSF: 0.0142, pFinal: 0.0033, pChampion: 0.0006 },
  HAI: { elo: 1554, pR32: 0.3311, pQF: 0.0242, pSF: 0.0048, pFinal: 0.0011, pChampion: 0.0004 },
  CPV: { elo: 1576, pR32: 0.3837, pQF: 0.0275, pSF: 0.0069, pFinal: 0.0016, pChampion: 0.0003 },
  SAU: { elo: 1566, pR32: 0.3637, pQF: 0.0270, pSF: 0.0073, pFinal: 0.0017, pChampion: 0.0003 },
  NZL: { elo: 1563, pR32: 0.4315, pQF: 0.0322, pSF: 0.0064, pFinal: 0.0009, pChampion: 0.0002 },
  RSA: { elo: 1518, pR32: 0.3869, pQF: 0.0275, pSF: 0.0044, pFinal: 0.0003, pChampion: 0.0001 },
  QAT: { elo: 1423, pR32: 0.3116, pQF: 0.0133, pSF: 0.0007, pFinal: 0.0000, pChampion: 0.0000 },
  CUW: { elo: 1433, pR32: 0.2245, pQF: 0.0067, pSF: 0.0008, pFinal: 0.0001, pChampion: 0.0000 },
  IRQ: { elo: 1608, pR32: 0.2949, pQF: 0.0301, pSF: 0.0089, pFinal: 0.0013, pChampion: 0.0000 },
  GHA: { elo: 1510, pR32: 0.2537, pQF: 0.0096, pSF: 0.0017, pFinal: 0.0005, pChampion: 0.0000 },
};
```

- [ ] **Commit**

```bash
git add src/data/static-predictions.js
git commit -m "feat: add static Elo predictions snapshot (4-jun-2026)"
```

---

### Task 3: Sección "Predicciones IA" en `Home.jsx`

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Agregar import y componente `IaCard` al inicio de `Home.jsx`**

Después de las importaciones existentes agregar:

```js
import { STATIC_PREDICTIONS } from '../data/static-predictions';
```

Agregar antes de la función `Home()`:

```jsx
function IaCard({ code, rank }) {
  const team = TEAMS[code];
  const pred = STATIC_PREDICTIONS[code];
  const isMex = code === 'MEX';
  const pct = Math.round((pred?.pChampion ?? 0) * 100 * 10) / 10;

  return (
    <div className={`card2 flex items-center gap-3 ${isMex ? 'border-green/30' : ''}`}>
      <span className="text-muted text-xs w-5 text-center">{rank}</span>
      <span className="text-xl">{team.flag}</span>
      <span className={`flex-1 text-sm ${isMex ? 'text-green font-bold' : ''}`}>{team.name}</span>
      <span className="text-sm font-bold tabular-nums" style={{ color: isMex ? '#00D463' : '#6B84A8' }}>
        {pct}%
      </span>
    </div>
  );
}
```

- [ ] **Agregar la sección al final del JSX de `Home()`, antes del `<p>` de disclaimer**

Reemplazar el bloque del disclaimer:

```jsx
      {/* Predicciones IA — baseline estático */}
      <div className="fade-up space-y-3">
        <div>
          <div className="tag mb-1">Predicciones IA · Baseline Elo (4-jun-2026)</div>
          <p className="text-xs text-muted">
            Snapshot de 10,000 simulaciones antes del torneo. No cambia con los resultados reales — úsalo como referencia.
          </p>
        </div>
        <div className="space-y-1">
          {Object.entries(STATIC_PREDICTIONS)
            .sort((a, b) => b[1].pChampion - a[1].pChampion)
            .slice(0, 10)
            .map(([code], i) => (
              <IaCard key={code} code={code} rank={i + 1} />
            ))}
        </div>
      </div>

      <p className="text-xs text-muted text-center pb-4 fade-up">
        Predicciones estadísticas de entretenimiento. No es asesoría de apuestas.
        Modelo Poisson + Monte Carlo basado en ranking FIFA.
      </p>
```

- [ ] **Verificar en el navegador** que la sección aparece al final de Home con el ranking ESP → ARG → FRA → ... → MEX.

- [ ] **Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat: add static IA predictions section to Home"
```

---

### Task 4: Crear `src/data/squads.js`

**Files:**
- Create: `src/data/squads.js`

- [ ] **Crear el archivo con México completo y estructura para los demás**

```js
// Plantillas oficiales Mundial 2026 — 26 convocados por selección
// Fuente: Excel Mundial_FIFA_2026_v2_86.xlsx, hoja "Squads" (línea 6349 en mundial_temp.md)
// Posiciones: POR = portero, DEF = defensa, MED = mediocampista, DEL = delantero
export const SQUADS = {
  MEX: {
    coach: 'Javier Aguirre',
    players: [
      { num: 1,  name: 'RANGEL Raul',      pos: 'POR', age: 26, club: 'CD Guadalajara' },
      { num: 12, name: 'ACEVEDO Carlos',   pos: 'POR', age: 30, club: 'Club Santos Laguna' },
      { num: 13, name: 'OCHOA Guillermo',  pos: 'POR', age: 40, club: 'AEL Limassol' },
      { num: 2,  name: 'SANCHEZ Jorge',    pos: 'DEF', age: 28, club: 'PAOK Saloniki' },
      { num: 3,  name: 'MONTES Cesar',     pos: 'DEF', age: 29, club: 'FC Lokomotiv Moscow' },
      { num: 4,  name: 'ALVAREZ Edson',    pos: 'DEF', age: 28, club: 'Fenerbahce SK' },
      { num: 5,  name: 'VASQUEZ Johan',    pos: 'DEF', age: 27, club: 'Genoa CFC' },
      { num: 15, name: 'REYES Israel',     pos: 'DEF', age: 26, club: 'Club América' },
      { num: 20, name: 'CHAVEZ Mateo',     pos: 'DEF', age: 22, club: 'AZ Alkmaar' },
      { num: 23, name: 'GALLARDO Jesus',   pos: 'DEF', age: 31, club: 'Deportivo Toluca FC' },
      { num: 6,  name: 'LIRA Erik',        pos: 'MED', age: 26, club: 'CF Cruz Azul' },
      { num: 7,  name: 'ROMO Luis',        pos: 'MED', age: 31, club: 'CD Guadalajara' },
      { num: 8,  name: 'FIDALGO Alvaro',   pos: 'MED', age: 29, club: 'Real Betis' },
      { num: 17, name: 'PINEDA Orbelin',   pos: 'MED', age: 30, club: 'AEK Athens' },
      { num: 18, name: 'VARGAS Obed',      pos: 'MED', age: 20, club: 'Atlético De Madrid' },
      { num: 19, name: 'MORA Gilberto',    pos: 'MED', age: 17, club: 'Club Tijuana' },
      { num: 24, name: 'CHAVEZ Luis',      pos: 'MED', age: 30, club: 'FC Dynamo Moscow' },
      { num: 26, name: 'GUTIERREZ Bryan',  pos: 'MED', age: 22, club: 'CD Guadalajara' },
      { num: 9,  name: 'JIMENEZ Raul',     pos: 'DEL', age: 35, club: 'Fulham FC' },
      { num: 10, name: 'VEGA Alexis',      pos: 'DEL', age: 28, club: 'Deportivo Toluca FC' },
      { num: 11, name: 'GIMENEZ Santiago', pos: 'DEL', age: 25, club: 'AC Milan' },
      { num: 14, name: 'GONZALEZ Armando', pos: 'DEL', age: 23, club: 'CD Guadalajara' },
      { num: 16, name: 'QUINONES Julian',  pos: 'DEL', age: 29, club: 'Al Qadsiah FC' },
      { num: 21, name: 'HUERTA Cesar',     pos: 'DEL', age: 25, club: 'RSC Anderlecht' },
      { num: 22, name: 'MARTINEZ Guillermo', pos: 'DEL', age: 31, club: 'Pumas UNAM' },
      { num: 25, name: 'ALVARADO Roberto', pos: 'DEL', age: 27, club: 'CD Guadalajara' },
    ],
  },
  // ── Agrega los 47 equipos restantes siguiendo la misma estructura ──
  // Fuente de datos: C:\Users\Diego\Downloads\mundial_temp.md a partir de la línea 6349 (## Squads)
  // Cada bloque en el Excel muestra: #, Camiseta (apellido), Pos, Edad, Alt, Club
  // Ejemplo mínimo para verificar que la página funciona con otros equipos:
  ESP: {
    coach: 'Luis de la Fuente',
    players: [
      { num: 1,  name: 'SIMON Unai',       pos: 'POR', age: 27, club: 'Athletic Bilbao' },
      { num: 9,  name: 'MORATA Alvaro',    pos: 'DEL', age: 31, club: 'Atlético Madrid' },
      { num: 10, name: 'PEDRI',            pos: 'MED', age: 22, club: 'FC Barcelona' },
    ],
  },
  ARG: {
    coach: 'Lionel Scaloni',
    players: [
      { num: 1,  name: 'MARTINEZ Emiliano', pos: 'POR', age: 32, club: 'Aston Villa' },
      { num: 10, name: 'MESSI Lionel',      pos: 'DEL', age: 38, club: 'Inter Miami CF' },
      { num: 11, name: 'DI MARIA Angel',    pos: 'DEL', age: 36, club: 'Benfica' },
    ],
  },
};
```

> **Nota para el implementador:** Los 45 equipos restantes deben poblarse leyendo el archivo `C:\Users\Diego\Downloads\mundial_temp.md` a partir de la línea 6349 (sección `## Squads`). Cada equipo tiene un bloque de 26 filas con los campos: #, Camiseta, Pos, Edad, Alt, Club. Agregar los jugadores incompletos de ESP y ARG también.

- [ ] **Commit**

```bash
git add src/data/squads.js
git commit -m "feat: add squads data file (MEX complete, structure for 48 teams)"
```

---

### Task 5: Página `Squads.jsx` + ruta + nav

**Files:**
- Create: `src/pages/Squads.jsx`
- Modify: `src/App.jsx`

- [ ] **Crear `src/pages/Squads.jsx`**

```jsx
import { useState, useMemo } from 'react';
import { SQUADS } from '../data/squads';
import { TEAMS, GROUPS } from '../data/teams';

const POS_ORDER = ['POR', 'DEF', 'MED', 'DEL'];
const POS_LABEL = { POR: 'Porteros', DEF: 'Defensas', MED: 'Mediocampistas', DEL: 'Delanteros' };

export default function Squads() {
  const [selectedTeam, setSelectedTeam] = useState('MEX');
  const [search, setSearch] = useState('');

  const filteredTeams = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return Object.keys(TEAMS).filter(code => {
      const team = TEAMS[code];
      if (team.name.toLowerCase().includes(q)) return true;
      const squad = SQUADS[code];
      return squad?.players?.some(p => p.name.toLowerCase().includes(q));
    });
  }, [search]);

  const squad = SQUADS[selectedTeam];
  const team  = TEAMS[selectedTeam];

  const playersByPos = useMemo(() => {
    if (!squad) return {};
    return POS_ORDER.reduce((acc, pos) => {
      acc[pos] = squad.players.filter(p => p.pos === pos).sort((a, b) => a.num - b.num);
      return acc;
    }, {});
  }, [squad]);

  return (
    <div className="space-y-5">
      <div>
        <div className="tag mb-1">Plantillas oficiales · 48 selecciones</div>
        <h1 className="text-xl font-bold">Squads</h1>
      </div>

      {/* Buscador */}
      <input
        className="w-full bg-card2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-green/50"
        placeholder="Buscar equipo o jugador…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Resultados de búsqueda */}
      {filteredTeams && (
        <div className="flex flex-wrap gap-2">
          {filteredTeams.map(code => (
            <button
              key={code}
              onClick={() => { setSelectedTeam(code); setSearch(''); }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-card2 border border-border hover:border-green/40 transition-colors"
            >
              <span>{TEAMS[code].flag}</span>
              <span>{TEAMS[code].name}</span>
            </button>
          ))}
          {filteredTeams.length === 0 && (
            <p className="text-muted text-sm">Sin resultados.</p>
          )}
        </div>
      )}

      {/* Chips por grupo */}
      {!filteredTeams && (
        <div className="space-y-3">
          {Object.entries(GROUPS).map(([g, codes]) => (
            <div key={g}>
              <div className="text-xs text-muted mb-1.5">Grupo {g}</div>
              <div className="flex flex-wrap gap-2">
                {codes.map(code => (
                  <button
                    key={code}
                    onClick={() => setSelectedTeam(code)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedTeam === code
                        ? code === 'MEX'
                          ? 'bg-green/20 border-green text-green font-bold'
                          : 'bg-card2 border-white/40 text-white font-bold'
                        : 'bg-card2 border-border text-muted hover:text-white'
                    }`}
                  >
                    <span>{TEAMS[code].flag}</span>
                    <span>{TEAMS[code].name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Squad del equipo seleccionado */}
      {squad ? (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{team.flag}</span>
            <div>
              <div className={`font-bold ${selectedTeam === 'MEX' ? 'text-green' : ''}`}>{team.name}</div>
              <div className="text-xs text-muted">DT: {squad.coach} · {squad.players.length} convocados</div>
            </div>
          </div>
          {POS_ORDER.map(pos => (
            playersByPos[pos]?.length > 0 && (
              <div key={pos}>
                <div className="tag mb-2">{POS_LABEL[pos]}</div>
                <div className="space-y-1">
                  {playersByPos[pos].map(p => (
                    <div key={p.num} className="card2 flex items-center gap-3 text-sm">
                      <span className="text-muted w-5 text-right tabular-nums text-xs">{p.num}</span>
                      <span className="flex-1 font-medium">{p.name}</span>
                      <span className="text-muted text-xs">{p.age}a</span>
                      <span className="text-muted text-xs truncate max-w-[140px] text-right">{p.club}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="card text-center text-muted text-sm py-8">
          Squad no disponible para este equipo todavía.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Agregar ruta y nav link en `src/App.jsx`**

Agregar import:
```js
import Squads from './pages/Squads';
```

En el array `links` del componente `Nav`, agregar después de Grupos:
```js
{ to: '/squads',        label: 'Squads' },
```

En `<Routes>`, agregar:
```jsx
<Route path="/squads" element={<Squads />} />
```

- [ ] **Verificar en el navegador**: la página `/squads` muestra México seleccionado por defecto con sus 26 jugadores agrupados por posición. El buscador filtra equipos.

- [ ] **Commit**

```bash
git add src/pages/Squads.jsx src/App.jsx
git commit -m "feat: add Squads page with team selector and player roster"
```

---

## NIVEL 2 — Depende de grupos

---

### Task 6: Firebase `discipline` listener en `App.jsx`

**Files:**
- Modify: `src/App.jsx`

- [ ] **Agregar estado y listener de discipline en `App.jsx`**

Después de `const [authLoading, setAuthLoading] = useState(true);` agregar:
```js
const [discipline, setDiscipline] = useState({});
```

Después del `useEffect` de results (el primero), agregar:
```js
useEffect(() => {
  const r = ref(db, 'discipline');
  const unsub = onValue(r, snap => {
    setDiscipline(snap.val() ?? {});
  });
  return unsub;
}, []);
```

- [ ] **Actualizar `AppCtx.Provider` para incluir `discipline`**

Cambiar:
```jsx
<AppCtx.Provider value={{ results, predictions, loading, user, authLoading }}>
```
Por:
```jsx
<AppCtx.Provider value={{ results, discipline, predictions, loading, user, authLoading }}>
```

- [ ] **Commit**

```bash
git add src/App.jsx
git commit -m "feat: add Firebase discipline listener to app context"
```

---

### Task 7: Fair Play en `getCurrentStandings`

**Files:**
- Modify: `src/model/simulation.js`
- Create: `src/model/simulation.test.js`

- [ ] **Crear test fallido en `src/model/simulation.test.js`**

```js
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
```

- [ ] **Verificar que el test falla**

```bash
npm test
```

Resultado esperado: `Cannot find module './simulation'` o `fairPlayPoints is not a function`.

- [ ] **Implementar `fairPlayPoints` y actualizar `getCurrentStandings` en `simulation.js`**

Agregar la función exportada después de `getMatchProbs`:

```js
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
```

Modificar `getCurrentStandings` para aceptar `discipline` y usarlo como 5° desempate:

```js
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
```

- [ ] **Actualizar las llamadas a `getCurrentStandings` en `Groups.jsx`**

En `src/pages/Groups.jsx`, cambiar:
```js
const { results, predictions } = useApp();
const standings = getCurrentStandings(groupKey, results);
```
Por:
```js
const { results, discipline, predictions } = useApp();
const standings = getCurrentStandings(groupKey, results, discipline);
```

- [ ] **Verificar que los tests pasan**

```bash
npm test
```

Resultado esperado: `4 tests passed`.

- [ ] **Commit**

```bash
git add src/model/simulation.js src/model/simulation.test.js src/pages/Groups.jsx
git commit -m "feat: add Fair Play tiebreaker to group standings"
```

---

### Task 8: Tab "Disciplina" en `Admin.jsx`

**Files:**
- Modify: `src/pages/Admin.jsx`

- [ ] **Reemplazar el contenido de `Admin.jsx` con la versión con tabs**

```jsx
import { useState } from 'react';
import { ref, set } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useApp } from '../App';
import { TEAMS, GROUPS } from '../data/teams';
import { FIXTURES_BY_GROUP, FIXTURES } from '../data/fixtures';

// ── Componente de fila de partido (grupos) — sin cambios ──────────────────────
function MatchRow({ fixture, existingResult, onSave }) {
  const home = TEAMS[fixture.home];
  const away = TEAMS[fixture.away];
  const played = existingResult?.played;
  const [hs, setHs] = useState(played ? String(existingResult.homeScore) : '');
  const [as_, setAs] = useState(played ? String(existingResult.awayScore) : '');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  async function handleSave() {
    const h = parseInt(hs), a = parseInt(as_);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0 || h > 20 || a > 20) return;
    setSaving(true);
    await onSave(fixture.id, h, a);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleClear() {
    setSaving(true);
    await onSave(fixture.id, null, null, false);
    setHs(''); setAs('');
    setSaving(false);
  }

  return (
    <div className={`card2 space-y-2 ${played ? 'border-green/25' : ''}`}>
      <div className="tag text-xs">{fixture.date} · J{fixture.matchday}</div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-base">{home.flag}</span>
          <span className="text-sm font-bold truncate">{home.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <input className="input-field" type="number" min="0" max="20" value={hs} onChange={e => setHs(e.target.value)} placeholder="–" />
          <span className="text-muted">–</span>
          <input className="input-field" type="number" min="0" max="20" value={as_} onChange={e => setAs(e.target.value)} placeholder="–" />
        </div>
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <span className="text-sm font-bold truncate text-right">{away.name}</span>
          <span className="text-base">{away.flag}</span>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {played && (
          <button onClick={handleClear} className="text-xs text-muted hover:text-red transition-colors px-2 py-1" disabled={saving}>Borrar</button>
        )}
        <button onClick={handleSave} disabled={saving || hs === '' || as_ === ''}
          className={`text-xs font-bold px-3 py-1 rounded transition-all ${saved ? 'bg-green/20 text-green' : 'bg-green text-bg hover:opacity-90 disabled:opacity-40'}`}>
          {saved ? '✓ Guardado' : saving ? '…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

// ── Tab de disciplina ─────────────────────────────────────────────────────────
function DisciplinaTab({ discipline }) {
  const [activeGroup, setActiveGroup] = useState('A');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(null);

  const fixtures = FIXTURES_BY_GROUP[activeGroup] ?? [];

  async function saveDiscipline(teamCode, matchId, yellow, red) {
    const key = `${teamCode}_${matchId}`;
    setSaving(true);
    await set(ref(db, `discipline/${key}`), { yellow, red });
    setSaving(false);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Selector de grupo */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(GROUPS).map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className={`px-3 py-1 rounded text-sm font-mono transition-colors ${activeGroup === g ? 'bg-green text-bg font-bold' : 'bg-card2 text-muted hover:text-white border border-border'}`}>
            {g === 'A' ? '🇲🇽 A' : `Grupo ${g}`}
          </button>
        ))}
      </div>

      {/* Partidos */}
      <div className="space-y-2">
        <div className="tag">Grupo {activeGroup}</div>
        {fixtures.map(f => {
          const home = TEAMS[f.home];
          const away = TEAMS[f.away];
          const dHome = discipline[`${f.home}_${f.id}`] ?? { yellow: 0, red: 0 };
          const dAway = discipline[`${f.away}_${f.id}`] ?? { yellow: 0, red: 0 };

          return (
            <div key={f.id} className="card2 space-y-3">
              <div className="tag text-xs">Partido {f.id} · {f.date} · J{f.matchday}</div>
              <div className="text-sm text-center font-bold">
                {home.flag} {home.name} vs {away.name} {away.flag}
              </div>

              {/* Inputs por equipo */}
              {[
                { team: home, code: f.home, d: dHome },
                { team: away, code: f.away, d: dAway },
              ].map(({ team, code, d }) => {
                const [y, setY] = useState(String(d.yellow ?? 0));
                const [r, setR] = useState(String(d.red ?? 0));
                const key = `${code}_${f.id}`;

                return (
                  <div key={code} className="flex items-center gap-3">
                    <span className="text-base">{team.flag}</span>
                    <span className="flex-1 text-sm">{team.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">🟡</span>
                      <input className="input-field w-10" type="number" min="0" max="20" value={y} onChange={e => setY(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">🔴</span>
                      <input className="input-field w-10" type="number" min="0" max="20" value={r} onChange={e => setR(e.target.value)} />
                    </div>
                    <button
                      disabled={saving}
                      onClick={() => saveDiscipline(code, f.id, parseInt(y) || 0, parseInt(r) || 0)}
                      className={`text-xs font-bold px-2 py-1 rounded transition-all ${saved === key ? 'bg-green/20 text-green' : 'bg-card border border-border text-muted hover:text-white disabled:opacity-40'}`}>
                      {saved === key ? '✓' : 'OK'}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Admin principal con tabs ───────────────────────────────────────────────────
export default function Admin() {
  const { results, discipline, user } = useApp();
  const [activeTab,   setActiveTab]   = useState('resultados');
  const [activeGroup, setActiveGroup] = useState('A');

  async function saveResult(matchId, homeScore, awayScore, played = true) {
    const r = ref(db, `results/${matchId}`);
    await set(r, played ? { homeScore, awayScore, played: true } : null);
  }

  const fixtures = FIXTURES_BY_GROUP[activeGroup] ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="tag mb-1">Ingreso de resultados</div>
          <h1 className="text-xl font-bold">Admin</h1>
        </div>
        <button onClick={() => signOut(auth)} className="text-xs text-muted hover:text-white transition-colors px-2 py-1 mt-1">
          Cerrar sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {['resultados', 'disciplina'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-white font-bold border-green' : 'text-muted border-transparent hover:text-white'}`}>
            {tab === 'resultados' ? 'Resultados' : 'Disciplina'}
          </button>
        ))}
      </div>

      {/* Tab: Resultados */}
      {activeTab === 'resultados' && (
        <div className="space-y-4">
          <p className="text-xs text-muted">Las predicciones se recalculan automáticamente para todos los usuarios.</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(GROUPS).map(g => (
              <button key={g} onClick={() => setActiveGroup(g)}
                className={`px-3 py-1 rounded text-sm font-mono transition-colors ${activeGroup === g ? 'bg-green text-bg font-bold' : 'bg-card2 text-muted hover:text-white border border-border'}`}>
                {g === 'A' ? '🇲🇽 A' : `Grupo ${g}`}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <div className="tag">Grupo {activeGroup}</div>
            {[1, 2, 3].map(md => {
              const mdFixtures = fixtures.filter(f => f.matchday === md);
              if (!mdFixtures.length) return null;
              return (
                <div key={md}>
                  <div className="text-xs text-muted mb-2 mt-3">Jornada {md}</div>
                  <div className="space-y-2">
                    {mdFixtures.map(f => (
                      <MatchRow key={f.id} fixture={f} existingResult={results[f.id]} onSave={saveResult} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Disciplina */}
      {activeTab === 'disciplina' && <DisciplinaTab discipline={discipline} />}
    </div>
  );
}
```

- [ ] **Verificar en el navegador**: Admin tiene dos tabs. "Disciplina" muestra los partidos del grupo seleccionado con inputs de tarjetas por equipo. Guardar escribe en Firebase `discipline/MEX_1`.

- [ ] **Commit**

```bash
git add src/pages/Admin.jsx
git commit -m "feat: add Disciplina tab to Admin for card tracking"
```

---

### Task 9: `getRankedThirds` en `simulation.js`

**Files:**
- Modify: `src/model/simulation.js`
- Modify: `src/model/simulation.test.js`

- [ ] **Agregar test fallido en `simulation.test.js`**

```js
import { getRankedThirds } from './simulation';

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
```

- [ ] **Ejecutar tests — deben fallar**

```bash
npm test
```

- [ ] **Implementar `getRankedThirds` en `simulation.js`**

Agregar al final del archivo:

```js
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
```

- [ ] **Ejecutar tests — deben pasar**

```bash
npm test
```

Resultado esperado: todos los tests pasan.

- [ ] **Commit**

```bash
git add src/model/simulation.js src/model/simulation.test.js
git commit -m "feat: add getRankedThirds function with FIFA tiebreaker rules"
```

---

### Task 10: Tab "Terceros" en `Groups.jsx`

**Files:**
- Modify: `src/pages/Groups.jsx`

- [ ] **Reemplazar el contenido de `Groups.jsx`**

```jsx
import { useState, useMemo } from 'react';
import { Fragment } from 'react';
import { useApp } from '../App';
import { TEAMS, GROUPS } from '../data/teams';
import { getCurrentStandings, getRankedThirds } from '../model/simulation';
import ProbBar from '../components/ProbBar';

function GroupTable({ groupKey }) {
  const { results, discipline, predictions } = useApp();
  const standings = getCurrentStandings(groupKey, results, discipline);

  return (
    <div className="card space-y-1">
      <div className="flex items-center justify-between mb-2">
        <div className="tag">Grupo {groupKey}</div>
        <div className="text-xs text-muted">pts  clasifica</div>
      </div>
      {standings.map((s, i) => {
        const team  = TEAMS[s.code];
        const isMex = s.code === 'MEX';
        const pQ    = predictions[s.code]?.pQualify ?? 0;
        const advancing = i < 2;
        return (
          <Fragment key={s.code}>
            {i === 2 && <div className="border-t border-dashed border-border/60 my-1" />}
            <div className={`flex items-center gap-2 py-1 px-2 rounded ${isMex ? 'bg-green/10 border border-green/20' : advancing ? '' : 'opacity-55'}`}>
              <span className="text-muted text-xs w-4">{i + 1}</span>
              <span className="text-base">{team.flag}</span>
              <span className={`flex-1 text-sm ${isMex ? 'text-green font-bold' : ''}`}>{team.name}</span>
              <span className="text-xs tabular-nums text-muted">{s.pj > 0 ? `${s.pj}j` : '–'}</span>
              <span className="text-sm font-bold tabular-nums w-5 text-right">{s.pts}</span>
              <div className="w-20 flex items-center gap-1">
                <ProbBar pct={pQ} height={4} showLabel />
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

function TercerosTab() {
  const { results, discipline } = useApp();
  const allStandings = useMemo(() => {
    const s = {};
    for (const g of Object.keys(GROUPS)) {
      s[g] = getCurrentStandings(g, results, discipline);
    }
    return s;
  }, [results, discipline]);

  const thirds = getRankedThirds(allStandings, discipline);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Los 8 mejores terceros clasifican a 16avos. Orden: Pts → DG → GF → Fair Play.
      </p>
      <div className="card space-y-1">
        {thirds.map((t, i) => {
          const team  = TEAMS[t.code];
          const isMex = t.code === 'MEX';
          return (
            <Fragment key={t.code}>
              {i === 8 && <div className="border-t border-dashed border-border/60 my-2" />}
              <div className={`flex items-center gap-2 py-1.5 px-2 rounded ${isMex ? 'bg-green/10 border border-green/20' : t.advancing ? '' : 'opacity-50'}`}>
                <span className="text-muted text-xs w-5 text-center">{i + 1}</span>
                <span className="text-base">{team.flag}</span>
                <span className={`flex-1 text-sm ${isMex ? 'text-green font-bold' : ''}`}>{team.name}</span>
                <span className="text-xs text-muted">Gpo {t.group}</span>
                <span className="text-xs tabular-nums text-muted w-6 text-right">{t.pts}pts</span>
                {t.advancing && (
                  <span className="text-xs bg-green/20 text-green px-1.5 py-0.5 rounded font-bold">✓</span>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function Groups() {
  const [activeTab, setActiveTab] = useState('tablas');

  return (
    <div className="space-y-4">
      <div>
        <div className="tag mb-1">Fase de grupos · 12 grupos · 48 equipos</div>
        <h1 className="text-xl font-bold">Grupos</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: 'tablas',   label: 'Tablas' },
          { key: 'terceros', label: 'Mejores terceros' },
          { key: 'escenarios', label: 'Escenarios' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${activeTab === tab.key ? 'text-white font-bold border-green' : 'text-muted border-transparent hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'tablas' && (
        <div>
          <p className="text-xs text-muted mb-3">% = probabilidad de clasificar a octavos según el modelo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(GROUPS).map(g => <GroupTable key={g} groupKey={g} />)}
          </div>
        </div>
      )}

      {activeTab === 'terceros' && <TercerosTab />}

      {activeTab === 'escenarios' && (
        <div className="card text-muted text-sm text-center py-8">
          Escenarios — se implementa en Task 16.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Verificar en el navegador**: Grupos tiene tres tabs. "Mejores terceros" muestra los 12 terceros ordenados con badge verde para los 8 clasificados.

- [ ] **Commit**

```bash
git add src/pages/Groups.jsx
git commit -m "feat: add Terceros tab to Groups page"
```

---

## NIVEL 3 — Depende de Terceros

---

### Task 11: Crear `src/data/ko-fixtures.js`

**Files:**
- Create: `src/data/ko-fixtures.js`

- [ ] **Crear el archivo con los 32 partidos KO**

```js
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
```

- [ ] **Commit**

```bash
git add src/data/ko-fixtures.js
git commit -m "feat: add KO fixtures data (matches 73-104)"
```

---

### Task 12: Firebase `ko_results` listener en `App.jsx`

**Files:**
- Modify: `src/App.jsx`

- [ ] **Agregar estado y listener de `ko_results` en `App.jsx`**

Después de `const [discipline, setDiscipline] = useState({});` agregar:
```js
const [koResults, setKoResults] = useState({});
```

Después del `useEffect` de discipline agregar:
```js
useEffect(() => {
  const r = ref(db, 'ko_results');
  const unsub = onValue(r, snap => {
    setKoResults(snap.val() ?? {});
  });
  return unsub;
}, []);
```

- [ ] **Actualizar `AppCtx.Provider`**

```jsx
<AppCtx.Provider value={{ results, discipline, koResults, predictions, loading, user, authLoading }}>
```

- [ ] **Commit**

```bash
git add src/App.jsx
git commit -m "feat: add Firebase ko_results listener to app context"
```

---

### Task 13: `resolveKOSlot` en `simulation.js`

**Files:**
- Modify: `src/model/simulation.js`
- Modify: `src/model/simulation.test.js`

- [ ] **Agregar import de ko-fixtures al inicio de `simulation.js`**

```js
import { KO_FIXTURE_BY_ID } from '../data/ko-fixtures';
```

- [ ] **Agregar tests en `simulation.test.js`**

```js
import { resolveKOSlot } from './simulation';
import { TEAMS } from '../data/teams';

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
```

- [ ] **Ejecutar tests — deben fallar**

```bash
npm test
```

- [ ] **Implementar `resolveKOSlot` en `simulation.js`**

Agregar después de `getRankedThirds`:

```js
// Resuelve un slot del bracket KO a un objeto de equipo {code, name, flag}.
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
```

- [ ] **Ejecutar tests — deben pasar**

```bash
npm test
```

Resultado esperado: todos los tests pasan.

- [ ] **Commit**

```bash
git add src/model/simulation.js src/model/simulation.test.js
git commit -m "feat: add resolveKOSlot for bracket resolution"
```

---

### Task 14: Página `Eliminatoria.jsx` + ruta + nav

**Files:**
- Create: `src/pages/Eliminatoria.jsx`
- Modify: `src/App.jsx`

- [ ] **Crear `src/pages/Eliminatoria.jsx`**

```jsx
import { useMemo } from 'react';
import { useApp } from '../App';
import { GROUPS } from '../data/teams';
import { KO_FIXTURES } from '../data/ko-fixtures';
import { getCurrentStandings, resolveKOSlot } from '../model/simulation';

const ROUND_META = {
  R32: { label: '16avos de final',   color: '#6B84A8' },
  R16: { label: 'Octavos de final',  color: '#00B4FF' },
  QF:  { label: 'Cuartos de final',  color: '#FFD600' },
  SF:  { label: 'Semifinales',       color: '#FF6B35' },
  F:   { label: 'Final',             color: '#FFD600' },
  '3rd': { label: 'Tercer lugar',    color: '#C0C0C0' },
};

const ROUND_ORDER = ['R32', 'R16', 'QF', 'SF', 'F', '3rd'];

function MatchCard({ fixture, allGroupStandings, koResults }) {
  const home = resolveKOSlot(fixture.home, allGroupStandings, koResults);
  const away = resolveKOSlot(fixture.away, allGroupStandings, koResults);
  const result = koResults[String(fixture.id)];
  const played = result?.played;
  const isMexHome = home?.code === 'MEX';
  const isMexAway = away?.code === 'MEX';

  function slotLabel(code) {
    if (!code) return '–';
    const posMatch = code.match(/^([123])([A-L])$/);
    if (posMatch) return `${posMatch[1]}° Grupo ${posMatch[2]}`;
    const winMatch = code.match(/^W(\d+)$/);
    if (winMatch) return `Gan. P${winMatch[1]}`;
    const loseMatch = code.match(/^L(\d+)$/);
    if (loseMatch) return `Per. P${loseMatch[1]}`;
    return code;
  }

  return (
    <div className={`card2 space-y-1.5 min-w-0 ${(isMexHome || isMexAway) ? 'border-green/30' : ''}`}>
      <div className="text-xs text-muted">P{fixture.id} · {fixture.date}</div>

      {/* Equipo local */}
      <div className={`flex items-center gap-2 text-sm ${isMexHome ? 'text-green font-bold' : home ? '' : 'text-muted'}`}>
        {home ? (
          <><span className="text-base">{home.flag}</span><span className="truncate">{home.name}</span></>
        ) : (
          <span className="text-xs italic">{slotLabel(fixture.home)}</span>
        )}
        {played && <span className="ml-auto font-bold tabular-nums">{result.homeScore}</span>}
      </div>

      {/* Equipo visitante */}
      <div className={`flex items-center gap-2 text-sm ${isMexAway ? 'text-green font-bold' : away ? '' : 'text-muted'}`}>
        {away ? (
          <><span className="text-base">{away.flag}</span><span className="truncate">{away.name}</span></>
        ) : (
          <span className="text-xs italic">{slotLabel(fixture.away)}</span>
        )}
        {played && <span className="ml-auto font-bold tabular-nums">{result.awayScore}</span>}
      </div>

      {/* Estadio */}
      <div className="text-xs text-muted truncate">{fixture.stadium}</div>
    </div>
  );
}

export default function Eliminatoria() {
  const { results, discipline, koResults } = useApp();

  const allGroupStandings = useMemo(() => {
    const s = {};
    for (const g of Object.keys(GROUPS)) {
      s[g] = getCurrentStandings(g, results, discipline);
    }
    return s;
  }, [results, discipline]);

  const byRound = useMemo(() => {
    const acc = {};
    for (const f of KO_FIXTURES) {
      if (!acc[f.round]) acc[f.round] = [];
      acc[f.round].push(f);
    }
    return acc;
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <div className="tag mb-1">Fase eliminatoria · 32 partidos</div>
        <h1 className="text-xl font-bold">Eliminatoria</h1>
        <p className="text-xs text-muted mt-1">Captura los resultados en Admin → Resultados.</p>
      </div>

      {/* Bracket horizontal con scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {ROUND_ORDER.map(round => {
            const fixtures = byRound[round] ?? [];
            if (!fixtures.length) return null;
            const meta = ROUND_META[round];
            return (
              <div key={round} className="flex flex-col gap-2" style={{ width: '220px' }}>
                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: meta.color }}>
                  {meta.label}
                </div>
                <div className={`flex flex-col gap-2 ${round === 'R32' ? '' : 'justify-around h-full'}`}>
                  {fixtures.map(f => (
                    <MatchCard
                      key={f.id}
                      fixture={f}
                      allGroupStandings={allGroupStandings}
                      koResults={koResults}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Agregar import, ruta y nav en `App.jsx`**

Agregar import:
```js
import Eliminatoria from './pages/Eliminatoria';
```

En el array `links`, agregar después de Grupos:
```js
{ to: '/eliminatoria', label: 'Eliminatoria' },
```

En `<Routes>`, agregar:
```jsx
<Route path="/eliminatoria" element={<Eliminatoria />} />
```

- [ ] **Verificar en el navegador**: `/eliminatoria` muestra el bracket con 6 columnas. Los slots sin resolver muestran etiquetas como "1° Grupo A". México resaltado en verde cuando aparece.

- [ ] **Commit**

```bash
git add src/pages/Eliminatoria.jsx src/App.jsx
git commit -m "feat: add Eliminatoria page with horizontal bracket visual"
```

---

### Task 15: Admin KO — captura de resultados eliminatorios

**Files:**
- Modify: `src/pages/Admin.jsx`

- [ ] **Agregar componente `KOMatchRow` antes de `Admin` en `Admin.jsx`**

```jsx
import { KO_FIXTURES } from '../data/ko-fixtures';
import { getCurrentStandings, resolveKOSlot } from '../model/simulation';

function KOMatchRow({ fixture, existingResult, allGroupStandings, koResults, onSave }) {
  const home = resolveKOSlot(fixture.home, allGroupStandings, koResults);
  const away = resolveKOSlot(fixture.away, allGroupStandings, koResults);
  const played = existingResult?.played;

  const [hs, setHs] = useState(played ? String(existingResult.homeScore) : '');
  const [as_, setAs] = useState(played ? String(existingResult.awayScore) : '');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  async function handleSave() {
    const h = parseInt(hs), a = parseInt(as_);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0 || h === a) return;
    setSaving(true);
    await onSave(fixture.id, h, a);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleClear() {
    setSaving(true);
    await onSave(fixture.id, null, null, false);
    setHs(''); setAs('');
    setSaving(false);
  }

  if (!home || !away) return null;

  return (
    <div className={`card2 space-y-2 ${played ? 'border-green/25' : ''}`}>
      <div className="tag text-xs">P{fixture.id} · {fixture.date} · {fixture.time}</div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <span>{home.flag}</span>
          <span className="text-sm font-bold truncate">{home.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <input className="input-field" type="number" min="0" max="20" value={hs} onChange={e => setHs(e.target.value)} placeholder="–" />
          <span className="text-muted">–</span>
          <input className="input-field" type="number" min="0" max="20" value={as_} onChange={e => setAs(e.target.value)} placeholder="–" />
        </div>
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <span className="text-sm font-bold truncate text-right">{away.name}</span>
          <span>{away.flag}</span>
        </div>
      </div>
      <div className="text-xs text-muted text-center">{fixture.stadium} · {fixture.city}</div>
      <div className="flex gap-2 justify-end">
        {played && <button onClick={handleClear} className="text-xs text-muted hover:text-red px-2 py-1" disabled={saving}>Borrar</button>}
        <button onClick={handleSave} disabled={saving || hs === '' || as_ === '' || parseInt(hs) === parseInt(as_)}
          className={`text-xs font-bold px-3 py-1 rounded transition-all ${saved ? 'bg-green/20 text-green' : 'bg-green text-bg hover:opacity-90 disabled:opacity-40'}`}>
          {saved ? '✓ Guardado' : saving ? '…' : 'Guardar'}
        </button>
      </div>
      {hs !== '' && as_ !== '' && parseInt(hs) === parseInt(as_) && (
        <p className="text-xs text-red text-center">En KO no puede haber empate. Ingresa el resultado definitivo.</p>
      )}
    </div>
  );
}
```

- [ ] **Actualizar el tab "Resultados" en `Admin` para incluir selector de fase KO**

Dentro de `Admin`, agregar estado y lógica. Reemplazar el bloque `{activeTab === 'resultados' && ...}`:

```jsx
{activeTab === 'resultados' && (
  <ResultadosTab
    results={results}
    discipline={discipline}
    koResults={koResults}
    saveResult={saveResult}
  />
)}
```

Agregar el componente `ResultadosTab` antes de `Admin`:

```jsx
const KO_ROUNDS = [
  { key: 'R32', label: '16avos' },
  { key: 'R16', label: 'Octavos' },
  { key: 'QF',  label: 'Cuartos' },
  { key: 'SF',  label: 'Semifinal' },
  { key: 'F',   label: 'Final' },
  { key: '3rd', label: '3er lugar' },
];

function ResultadosTab({ results, discipline, koResults, saveResult }) {
  const [phase, setPhase]       = useState('grupos');
  const [activeGroup, setActiveGroup] = useState('A');

  const allGroupStandings = useMemo(() => {
    const s = {};
    for (const g of Object.keys(GROUPS)) {
      s[g] = getCurrentStandings(g, results, discipline);
    }
    return s;
  }, [results, discipline]);

  async function saveKOResult(matchId, homeScore, awayScore, played = true) {
    const r = ref(db, `ko_results/${matchId}`);
    await set(r, played ? { homeScore, awayScore, played: true } : null);
  }

  const fixtures = FIXTURES_BY_GROUP[activeGroup] ?? [];

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">Las predicciones se recalculan automáticamente.</p>

      {/* Selector de fase */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setPhase('grupos')}
          className={`px-3 py-1 rounded text-sm transition-colors ${phase === 'grupos' ? 'bg-green text-bg font-bold' : 'bg-card2 text-muted hover:text-white border border-border'}`}>
          Grupos
        </button>
        {KO_ROUNDS.map(r => (
          <button key={r.key} onClick={() => setPhase(r.key)}
            className={`px-3 py-1 rounded text-sm transition-colors ${phase === r.key ? 'bg-green text-bg font-bold' : 'bg-card2 text-muted hover:text-white border border-border'}`}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Grupos */}
      {phase === 'grupos' && (
        <>
          <div className="flex flex-wrap gap-2">
            {Object.keys(GROUPS).map(g => (
              <button key={g} onClick={() => setActiveGroup(g)}
                className={`px-3 py-1 rounded text-sm font-mono transition-colors ${activeGroup === g ? 'bg-green text-bg font-bold' : 'bg-card2 text-muted hover:text-white border border-border'}`}>
                {g === 'A' ? '🇲🇽 A' : `Grupo ${g}`}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <div className="tag">Grupo {activeGroup}</div>
            {[1, 2, 3].map(md => {
              const mdFixtures = fixtures.filter(f => f.matchday === md);
              if (!mdFixtures.length) return null;
              return (
                <div key={md}>
                  <div className="text-xs text-muted mb-2 mt-3">Jornada {md}</div>
                  <div className="space-y-2">
                    {mdFixtures.map(f => (
                      <MatchRow key={f.id} fixture={f} existingResult={results[f.id]} onSave={saveResult} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Fases KO */}
      {phase !== 'grupos' && (
        <div className="space-y-2">
          <div className="tag">{KO_ROUNDS.find(r => r.key === phase)?.label}</div>
          {KO_FIXTURES.filter(f => f.round === phase).map(f => (
            <KOMatchRow
              key={f.id}
              fixture={f}
              existingResult={koResults[String(f.id)]}
              allGroupStandings={allGroupStandings}
              koResults={koResults}
              onSave={saveKOResult}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Actualizar destructuring en `Admin`** para incluir `koResults` y el useMemo para standings:

```js
const { results, discipline, koResults, user } = useApp();
```

- [ ] **Verificar en el navegador**: Admin → Resultados tiene un selector de fases. Al seleccionar "16avos", muestra los partidos KO con equipos resueltos donde los haya, y permite capturar marcadores.

- [ ] **Commit**

```bash
git add src/pages/Admin.jsx
git commit -m "feat: add KO result capture to Admin Resultados tab"
```

---

### Task 16: Tab "Escenarios" en `Groups.jsx`

**Files:**
- Modify: `src/pages/Groups.jsx`

- [ ] **Agregar componente `EscenariosTab` en `Groups.jsx`** (reemplaza el placeholder del Task 10)

Agregar antes de la función `Groups`:

```jsx
function EscenariosTab() {
  const { results: realResults, discipline } = useApp();
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [hypoScores, setHypoScores] = useState({});

  const fixtures = useMemo(() => {
    return (FIXTURES_BY_GROUP[selectedGroup] ?? []).filter(f => f.matchday === 3);
  }, [selectedGroup]);

  const allFixtures = FIXTURES_BY_GROUP[selectedGroup] ?? [];

  // Combina resultados reales (J1+J2) con hipotéticos (J3)
  const hypoResults = useMemo(() => {
    const merged = { ...realResults };
    for (const f of fixtures) {
      const s = hypoScores[f.id];
      if (s && s.h !== '' && s.a !== '') {
        const h = parseInt(s.h), a = parseInt(s.a);
        if (!isNaN(h) && !isNaN(a)) {
          merged[f.id] = { homeScore: h, awayScore: a, played: true };
        }
      }
    }
    return merged;
  }, [realResults, hypoScores, fixtures]);

  const standings = getCurrentStandings(selectedGroup, hypoResults, discipline);

  function setScore(matchId, side, val) {
    setHypoScores(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side]: val },
    }));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Simula marcadores hipotéticos de la jornada 3 y ve cómo quedaría el grupo.
        Las jornadas 1 y 2 ya capturadas se respetan.
      </p>

      {/* Selector de grupo */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(GROUPS).map(g => (
          <button key={g} onClick={() => { setSelectedGroup(g); setHypoScores({}); }}
            className={`px-3 py-1 rounded text-sm font-mono transition-colors ${selectedGroup === g ? 'bg-green text-bg font-bold' : 'bg-card2 text-muted hover:text-white border border-border'}`}>
            {g === 'A' ? '🇲🇽 A' : `Grupo ${g}`}
          </button>
        ))}
      </div>

      {/* Inputs hipotéticos J3 */}
      <div className="space-y-2">
        <div className="tag">Jornada 3 — hipotético</div>
        {fixtures.map(f => {
          const home = TEAMS[f.home];
          const away = TEAMS[f.away];
          const s = hypoScores[f.id] ?? {};
          return (
            <div key={f.id} className="card2 flex items-center gap-2">
              <span className="text-base">{home.flag}</span>
              <span className="text-sm flex-1 truncate">{home.name}</span>
              <input className="input-field" type="number" min="0" max="20"
                value={s.h ?? ''} onChange={e => setScore(f.id, 'h', e.target.value)} placeholder="–" />
              <span className="text-muted text-xs">–</span>
              <input className="input-field" type="number" min="0" max="20"
                value={s.a ?? ''} onChange={e => setScore(f.id, 'a', e.target.value)} placeholder="–" />
              <span className="text-sm flex-1 truncate text-right">{away.name}</span>
              <span className="text-base">{away.flag}</span>
            </div>
          );
        })}
      </div>

      {/* Tabla resultante */}
      <div className="card space-y-1">
        <div className="tag mb-2">Tabla proyectada</div>
        {standings.map((s, i) => {
          const team  = TEAMS[s.code];
          const isMex = s.code === 'MEX';
          return (
            <Fragment key={s.code}>
              {i === 2 && <div className="border-t border-dashed border-border/60 my-1" />}
              <div className={`flex items-center gap-2 py-1 px-2 rounded text-sm ${isMex ? 'bg-green/10 border border-green/20' : i < 2 ? '' : 'opacity-55'}`}>
                <span className="text-muted text-xs w-4">{i + 1}</span>
                <span>{team.flag}</span>
                <span className={`flex-1 ${isMex ? 'text-green font-bold' : ''}`}>{team.name}</span>
                <span className="tabular-nums text-muted text-xs">{s.pj}j</span>
                <span className="font-bold tabular-nums w-5 text-right">{s.pts}</span>
                <span className="text-muted text-xs tabular-nums">{s.gd > 0 ? '+' : ''}{s.gd}</span>
                {i < 2 && <span className="text-xs text-green">✓</span>}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Agregar import de FIXTURES_BY_GROUP en Groups.jsx si no está**

Al inicio del archivo:
```js
import { FIXTURES_BY_GROUP } from '../data/fixtures';
```

- [ ] **Reemplazar el placeholder del tab Escenarios en el JSX de `Groups`**

```jsx
{activeTab === 'escenarios' && <EscenariosTab />}
```

- [ ] **Verificar en el navegador**: tab Escenarios muestra los dos partidos de J3 del grupo seleccionado con inputs hipotéticos. La tabla se actualiza al escribir marcadores.

- [ ] **Commit**

```bash
git add src/pages/Groups.jsx
git commit -m "feat: add Escenarios hypothetical simulator tab to Groups"
```

---

## Auto-revisión del plan

**Cobertura del spec:**
- ✅ Predicciones IA estáticas → Tasks 2, 3
- ✅ Squads completos → Tasks 4, 5
- ✅ Firebase discipline → Task 6
- ✅ Fair Play en standings → Task 7
- ✅ Tab Disciplina en Admin → Task 8
- ✅ Tabla de mejores terceros → Tasks 9, 10
- ✅ KO fixtures → Task 11
- ✅ Firebase ko_results → Task 12
- ✅ resolveKOSlot → Task 13
- ✅ Eliminatoria bracket → Task 14
- ✅ Admin KO → Task 15
- ✅ Escenarios → Task 16
- ✅ Nav actualizado → Tasks 5, 14 (Squads y Eliminatoria agregan sus links)

**Consistencia de tipos:**
- `fairPlayPoints(teamCode, matchIds, discipline)` — definido en T7, usado en T9 ✅
- `getCurrentStandings(group, results, discipline)` — actualizado en T7, usado en T10, T13, T14, T15, T16 ✅
- `getRankedThirds(allGroupStandings, discipline)` — definido en T9, usado en T10 ✅
- `resolveKOSlot(slotCode, allGroupStandings, koResults)` — definido en T13, usado en T14, T15 ✅
- `KO_FIXTURE_BY_ID` — definido en T11, importado en T13 ✅
- `koResults` en contexto — agregado en T12, consumido en T14, T15 ✅
- `discipline` en contexto — agregado en T6, consumido en T7, T8, T10, T14, T15, T16 ✅
