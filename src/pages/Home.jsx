import { useState } from 'react';
import { useApp } from '../App';
import { TEAMS } from '../data/teams';
import { STATIC_PREDICTIONS } from '../data/static-predictions';
import ProbBar from '../components/ProbBar';

const MEDALS = ['🥇', '🥈', '🥉'];

function InfoTooltip({ text }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative" style={{ lineHeight: 0 }}>
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        style={{
          width: 16, height: 16, borderRadius: '50%',
          border: '1px solid #4A6E8A', color: '#4A6E8A',
          fontSize: 10, fontFamily: 'IBM Plex Mono, monospace',
          background: 'transparent', cursor: 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-label="Más información"
      >i</button>
      {visible && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%',
          transform: 'translateX(-50%)', marginBottom: 8,
          width: 260, background: '#1C2E42', color: '#F7F8F0',
          fontSize: 11, lineHeight: 1.5, borderRadius: 8,
          padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          zIndex: 50,
        }}>
          {text}
          <span style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: '5px solid #1C2E42', width: 0, height: 0, display: 'block',
          }} />
        </div>
      )}
    </div>
  );
}

function ChampionCard({ code, pChampion, rank }) {
  const team   = TEAMS[code];
  const pct    = Math.round(pChampion * 100 * 10) / 10;
  const isMex  = code === 'MEX';
  const isTop3 = rank <= 3;
  const medal  = rank <= 3 ? MEDALS[rank - 1] : null;

  const stripColor = rank === 1 ? '#FADA7A' : rank === 2 ? '#C8C8B0' : rank === 3 ? '#BBD5DA' : '#E4EEF0';

  return (
    <div
      className={`card flex items-center gap-4 transition-colors slide-in ${
        isMex ? 'border-green/50' : ''
      }`}
      style={{
        animationDelay: `${(rank - 1) * 0.05}s`,
        borderLeft: `3px solid ${isMex ? '#0A6E35' : stripColor}`,
      }}
    >
      <span className="w-6 text-center text-sm">
        {medal ?? <span className="text-muted text-xs">{rank}</span>}
      </span>
      <span className="text-2xl">{team.flag}</span>
      <div className="flex-1 min-w-0">
        <div
          className="font-display font-bold text-sm"
          style={{
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: isMex ? '#0A6E35' : '#1C2E42',
          }}
        >
          {team.name}
          {isMex && <span className="ml-2 text-xs font-mono" style={{ color: '#0A6E35', opacity: 0.55 }}>← nosotros</span>}
        </div>
        <ProbBar pct={pChampion} height={4} />
      </div>
      <div className="text-right shrink-0">
        <div
          className="text-xl font-bold tabular-nums"
          style={{
            color: isMex ? '#0A6E35' : isTop3 ? '#A07808' : '#1C2E42',
          }}
        >
          {pct}%
        </div>
        <div className="tag text-xs">campeón</div>
      </div>
    </div>
  );
}

function IaCard({ code, rank }) {
  const team = TEAMS[code];
  const pred = STATIC_PREDICTIONS[code];
  const isMex = code === 'MEX';
  const pct = Math.round((pred?.pChampion ?? 0) * 100 * 10) / 10;

  return (
    <div
      className={`card2 flex items-center gap-3 slide-in ${isMex ? 'border-green/30' : ''}`}
      style={{ animationDelay: `${(rank - 1) * 0.04}s` }}
    >
      <span className="text-muted text-xs w-5 text-center">{rank}</span>
      <span className="text-xl">{team.flag}</span>
      <span
        className="flex-1 text-sm font-display font-bold"
        style={{
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: isMex ? '#0A6E35' : '#1C2E42',
        }}
      >
        {team.name}
      </span>
      <span className="text-sm font-bold tabular-nums" style={{ color: isMex ? '#0A6E35' : '#4A6E8A' }}>
        {pct}%
      </span>
    </div>
  );
}

export default function Home() {
  const { predictions } = useApp();

  const ranked = Object.entries(predictions)
    .sort((a, b) => b[1].pChampion - a[1].pChampion);

  const top10 = ranked.slice(0, 10).map(([code]) => code);
  if (!top10.includes('MEX')) top10.push('MEX');

  const [leaderCode] = ranked[0] ?? ['---', {}];
  const leader = TEAMS[leaderCode];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-up">
        <div className="tag mb-1">Monte Carlo · 8,000 simulaciones</div>
        <h1 className="font-display font-bold text-3xl text-text" style={{ letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          ¿Quién gana el Mundial?
        </h1>
      </div>

      {/* Hero — favorito actual */}
      {leader && (
        <div className="card relative overflow-hidden py-10 text-center fade-up" style={{ borderLeft: '4px solid #3674B5' }}>
          {/* Grid sutil */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#BBD5DA33 1px, transparent 1px), linear-gradient(90deg, #BBD5DA33 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Ghost number */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
          >
            <span
              className="font-display font-bold"
              style={{
                fontSize: '10rem',
                lineHeight: 1,
                color: 'transparent',
                WebkitTextStroke: '1.5px rgba(54,116,181,0.08)',
                letterSpacing: '-0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              {Math.round(predictions[leaderCode]?.pChampion * 1000) / 10}%
            </span>
          </div>
          {/* Glow desde izquierda */}
          <div
            className="absolute inset-0 pointer-events-none glow-breath"
            style={{ background: 'linear-gradient(90deg, rgba(54,116,181,0.06) 0%, transparent 50%)' }}
          />

          <div className="relative z-10 space-y-2">
            {/* Badge EN VIVO */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span
                className="w-1.5 h-1.5 rounded-full bg-red shrink-0"
                style={{ animation: 'livePulse 1.4s ease-in-out infinite' }}
              />
              <span className="tag" style={{ color: '#FF0000', letterSpacing: '0.2em' }}>EN VIVO</span>
              <span className="tag mx-1" style={{ opacity: 0.3 }}>·</span>
              <span className="tag">Favorito · Monte Carlo</span>
            </div>
            <div className="text-7xl leading-none mt-3 select-none">{leader.flag}</div>
            <div
              className="font-display font-bold mt-2"
              style={{ fontSize: '1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1C2E42' }}
            >
              {leader.name}
            </div>
            <div
              className="font-display font-bold tabular-nums leading-none"
              style={{ fontSize: '4.5rem', color: '#3674B5', letterSpacing: '-0.02em' }}
            >
              {Math.round(predictions[leaderCode]?.pChampion * 1000) / 10}%
            </div>
            <div className="tag">de ganar el Mundial</div>
          </div>
        </div>
      )}

      {/* Ranking */}
      <div className="fade-up">
        <div className="flex items-center gap-2 mb-3">
          <div className="tag">Top candidatos</div>
          <InfoTooltip text="Estas probabilidades son generadas por un modelo de simulación (Monte Carlo). Cobran más sentido una vez que termina la fase de grupos, cuando los resultados reales se van reflejando en los cálculos." />
        </div>
        <div className="space-y-2">
          {top10.map((code, i) => (
            <ChampionCard
              key={code}
              code={code}
              pChampion={predictions[code]?.pChampion ?? 0}
              rank={ranked.findIndex(([c]) => c === code) + 1}
            />
          ))}
        </div>
      </div>

      {/* Predicciones IA baseline */}
      <div className="fade-up space-y-3">
        <div>
          <div className="tag mb-1">Predicciones IA · Baseline Elo (4-jun-2026)</div>
          <p className="text-xs text-muted">
            Snapshot de 10,000 simulaciones antes del torneo. No cambia con los resultados reales.
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
    </div>
  );
}
