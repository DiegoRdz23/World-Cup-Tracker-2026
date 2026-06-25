import { useState, useMemo } from 'react';
import { useApp } from '../App';
import { TEAMS } from '../data/teams';
import { FIXTURES } from '../data/fixtures';
import { getMatchProbs, getScoreMatrix } from '../model/simulation';
import ProbBar from '../components/ProbBar';

// Agrupa array de fixtures por fecha ISO, ordenado cronológicamente
function groupByDate(fixtures) {
  const groups = {};
  for (const f of fixtures) {
    if (!groups[f.date]) groups[f.date] = [];
    groups[f.date].push(f);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ─── Card de partido en la lista ─────────────────────────────────────────────
function MatchCard({ fixture, result, onClick }) {
  const home = TEAMS[fixture.home];
  const away = TEAMS[fixture.away];
  const played = result?.played;

  const { lH, lA } = useMemo(
    () => getMatchProbs(fixture.home, fixture.away),
    [fixture.home, fixture.away]
  );

  let scoreColor = '#1C2E42';
  if (played) {
    if (result.homeScore > result.awayScore) scoreColor = '#0A6E35';
    else if (result.homeScore < result.awayScore) scoreColor = '#E05050';
    else scoreColor = '#4A6E8A';
  }

  return (
    <button
      onClick={onClick}
      className="card2 w-full text-left transition-colors"
      style={{ cursor: 'pointer' }}
    >
      <div className="flex items-center gap-3">
        {/* Equipo local */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl shrink-0">{home.flag}</span>
          <span className="text-sm font-bold truncate">{home.name}</span>
        </div>

        {/* Marcador o λ */}
        <div className="text-center shrink-0 w-24">
          {played ? (
            <span
              className="font-display font-bold tabular-nums text-xl"
              style={{ color: scoreColor }}
            >
              {result.homeScore} – {result.awayScore}
            </span>
          ) : (
            <span className="text-xs text-muted font-mono whitespace-nowrap">
              λ {lH.toFixed(1)} – {lA.toFixed(1)}
            </span>
          )}
        </div>

        {/* Equipo visitante */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm font-bold truncate text-right">{away.name}</span>
          <span className="text-xl shrink-0">{away.flag}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <span className="tag">Grupo {fixture.group}</span>
        <span className="tag">J{fixture.matchday}</span>
        {played && (
          <span className="tag" style={{ color: '#0A6E35' }}>Jugado</span>
        )}
      </div>
    </button>
  );
}

// ─── Matriz 6×6 de probabilidades Poisson ────────────────────────────────────
function ScoreMatrix({ homeCode, awayCode, actualHome, actualAway }) {
  const { matrix, lH, lA, win, draw, lose } = useMemo(
    () => getScoreMatrix(homeCode, awayCode),
    [homeCode, awayCode]
  );

  const home = TEAMS[homeCode];
  const away = TEAMS[awayCode];

  // Celda con mayor probabilidad
  let maxP = 0, maxI = 0, maxJ = 0;
  for (let i = 0; i <= 5; i++) {
    for (let j = 0; j <= 5; j++) {
      if (matrix[i][j] > maxP) { maxP = matrix[i][j]; maxI = i; maxJ = j; }
    }
  }

  const played = actualHome !== undefined && actualAway !== undefined;

  return (
    <div className="space-y-4">
      {/* Probabilidades resumen */}
      <div className="card space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">{home.flag} {home.name} gana</span>
            <span className="font-bold tabular-nums text-sm" style={{ color: '#3674B5' }}>
              {Math.round(win * 100)}%
            </span>
          </div>
          <ProbBar pct={win} color="#3674B5" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Empate</span>
            <span className="font-bold tabular-nums text-sm" style={{ color: '#4A6E8A' }}>
              {Math.round(draw * 100)}%
            </span>
          </div>
          <ProbBar pct={draw} color="#4A6E8A" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">{away.flag} {away.name} gana</span>
            <span className="font-bold tabular-nums text-sm" style={{ color: '#E05050' }}>
              {Math.round(lose * 100)}%
            </span>
          </div>
          <ProbBar pct={lose} color="#E05050" />
        </div>

        <div className="flex gap-6 pt-2 border-t border-border">
          <span className="text-xs text-muted">
            λ {home.name} = <b className="text-text">{lH.toFixed(2)}</b>
          </span>
          <span className="text-xs text-muted">
            λ {away.name} = <b className="text-text">{lA.toFixed(2)}</b>
          </span>
        </div>
      </div>

      {/* Matriz */}
      <div className="card">
        <div className="tag mb-3">Resultados más probables</div>
        <div className="overflow-x-auto">
          <table style={{ borderCollapse: 'separate', borderSpacing: 2 }} className="mx-auto">
            <thead>
              <tr>
                <th style={{ width: 40 }} />
                {[0,1,2,3,4,5].map(j => (
                  <th
                    key={j}
                    className="text-center font-mono text-xs text-muted font-normal"
                    style={{ width: 56, paddingBottom: 4 }}
                  >
                    {away.flag} {j}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0,1,2,3,4,5].map(i => (
                <tr key={i}>
                  <td className="text-right font-mono text-xs text-muted pr-2">
                    {home.flag} {i}
                  </td>
                  {[0,1,2,3,4,5].map(j => {
                    const p = matrix[i][j];
                    const pct = Math.round(p * 1000) / 10;
                    const isReal = played && actualHome === i && actualAway === j;
                    const isBest = !played && i === maxI && j === maxJ;

                    const zoneBg = i > j
                      ? 'rgba(54,116,181,0.07)'
                      : i === j
                      ? 'rgba(74,110,138,0.07)'
                      : 'rgba(224,80,80,0.07)';

                    return (
                      <td
                        key={j}
                        className="text-center tabular-nums"
                        style={{
                          width: 56,
                          height: 40,
                          fontSize: 11,
                          fontFamily: 'IBM Plex Mono, monospace',
                          background: isReal ? 'rgba(10,110,53,0.12)' : zoneBg,
                          border: isReal
                            ? '2px solid #0A6E35'
                            : isBest
                            ? '2px solid #3674B5'
                            : '1px solid #D4E8EA',
                          borderRadius: 4,
                          fontWeight: isReal || isBest ? 700 : 400,
                          color: isReal ? '#0A6E35' : isBest ? '#3674B5' : p >= 0.05 ? '#1C2E42' : '#4A6E8A',
                          verticalAlign: 'middle',
                          lineHeight: 1.2,
                        }}
                      >
                        {pct >= 0.1 ? `${pct}%` : '<0.1%'}
                        {isReal && <div style={{ fontSize: 9 }}>✓</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-1">
          {played && (
            <p className="text-xs text-center font-mono" style={{ color: '#0A6E35' }}>
              El resultado {actualHome}–{actualAway} tenía{' '}
              <b>{Math.round((matrix[actualHome]?.[actualAway] ?? 0) * 1000) / 10}%</b> de probabilidad
            </p>
          )}
          {!played && (
            <p className="text-xs text-center text-muted">
              Celda azul = resultado más probable según el modelo
            </p>
          )}
          <p className="text-xs text-center text-muted">
            <span style={{ color: '#3674B5' }}>■</span> Local gana &nbsp;
            <span style={{ color: '#4A6E8A' }}>■</span> Empate &nbsp;
            <span style={{ color: '#E05050' }}>■</span> Visitante gana
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Vista detalle de un partido ─────────────────────────────────────────────
function MatchDetail({ fixture, result, onBack }) {
  const home = TEAMS[fixture.home];
  const away = TEAMS[fixture.away];
  const played = result?.played;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
      >
        ← Partidos
      </button>

      <div className="card text-center space-y-2">
        <div className="tag">
          Grupo {fixture.group} · Jornada {fixture.matchday} · {formatDate(fixture.date)}
        </div>
        <div className="flex items-center justify-center gap-6 py-3">
          <div className="text-center">
            <div className="text-5xl">{home.flag}</div>
            <div className="font-bold text-sm mt-1">{home.name}</div>
          </div>
          {played ? (
            <div
              className="font-display font-bold tabular-nums"
              style={{ fontSize: '2.5rem', letterSpacing: '-0.02em', color: '#1C2E42' }}
            >
              {result.homeScore} – {result.awayScore}
            </div>
          ) : (
            <div className="text-muted text-2xl font-display">vs</div>
          )}
          <div className="text-center">
            <div className="text-5xl">{away.flag}</div>
            <div className="font-bold text-sm mt-1">{away.name}</div>
          </div>
        </div>
        {!played && (
          <div className="tag">Predicción pre-partido · Modelo Poisson + Rating FIFA</div>
        )}
        {played && (
          <div className="tag" style={{ color: '#0A6E35' }}>
            Partido terminado · Resultado real resaltado en verde ✓
          </div>
        )}
      </div>

      <ScoreMatrix
        homeCode={fixture.home}
        awayCode={fixture.away}
        actualHome={played ? result.homeScore : undefined}
        actualAway={played ? result.awayScore : undefined}
      />
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function Partidos() {
  const { results } = useApp();
  const [selected, setSelected] = useState(null);

  const grouped = useMemo(() => groupByDate(FIXTURES), []);

  if (selected) {
    return (
      <MatchDetail
        fixture={selected}
        result={results[selected.id]}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="fade-up">
        <div className="tag mb-1">Fase de grupos · {FIXTURES.length} partidos</div>
        <h1
          className="font-display font-bold text-2xl text-text"
          style={{ letterSpacing: '0.03em', textTransform: 'uppercase' }}
        >
          Partidos
        </h1>
        <p className="text-xs text-muted mt-1">
          Antes del partido: goles esperados (λ) y tabla de Poisson. Después: resultado real resaltado.
        </p>
      </div>

      {grouped.map(([date, fixtures]) => (
        <div key={date} className="space-y-2 fade-up">
          <div className="tag capitalize">{formatDate(date)}</div>
          {fixtures.map(f => (
            <MatchCard
              key={f.id}
              fixture={f}
              result={results[f.id]}
              onClick={() => setSelected(f)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
