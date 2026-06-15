import { useState, useMemo } from 'react';
import { Fragment } from 'react';
import { useApp } from '../App';
import { TEAMS, GROUPS } from '../data/teams';
import { FIXTURES_BY_GROUP } from '../data/fixtures';
import { getCurrentStandings, getRankedThirds } from '../model/simulation';
import ProbBar from '../components/ProbBar';

// Convierte emoji de bandera (🇲🇽) a código ISO2 (mx) para flagcdn.com
const FLAG_OVERRIDES = { '🏴󠁧󠁢󠁳󠁣󠁴󠁿': 'gb-sct' };
function flagImgUrl(emoji) {
  if (FLAG_OVERRIDES[emoji]) return `https://flagcdn.com/w20/${FLAG_OVERRIDES[emoji]}.png`;
  const chars = [...emoji];
  if (chars.length < 2) return '';
  const iso2 = chars.slice(0, 2)
    .map(c => String.fromCharCode(c.codePointAt(0) - 0x1F1E6 + 97))
    .join('');
  return `https://flagcdn.com/w20/${iso2}.png`;
}

function GroupTable({ groupKey }) {
  const { results, discipline, predictions } = useApp();
  const standings = getCurrentStandings(groupKey, results, discipline);

  return (
    <div className="card">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th colSpan={4} className="tag text-left pb-3 font-normal">Grupo {groupKey}</th>
            <th className="tag text-center pb-3 font-normal px-3 hidden sm:table-cell">PJ</th>
            <th className="tag text-center pb-3 font-normal px-3">DG</th>
            <th className="tag text-center pb-3 font-normal px-3">Pts</th>
            <th className="tag text-center pb-3 font-normal w-24">Clasifica</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const team     = TEAMS[s.code];
            const isMex    = s.code === 'MEX';
            const pQ       = predictions[s.code]?.pQualify ?? 0;
            const advancing = i < 2;
            const gdStr    = s.pj > 0 ? `${s.gd >= 0 ? '+' : ''}${s.gd}` : '–';
            return (
              <Fragment key={s.code}>
                {i === 2 && (
                  <tr>
                    <td colSpan={7} className="py-1">
                      <div className="border-t border-dashed border-border/60" />
                    </td>
                  </tr>
                )}
                <tr className={`rounded ${isMex ? 'bg-green/10' : advancing ? '' : 'opacity-55'}`}>
                  <td className="py-1.5 pl-1 pr-2 text-muted text-xs w-5">{i + 1}</td>
                  <td className="py-1.5 pr-1 text-xs text-muted font-mono w-7">{team.flag}</td>
                  <td className="py-1.5 pr-2 w-6">
                    <img
                      src={flagImgUrl(team.flag)}
                      width={22} height={15}
                      alt={team.name}
                      className="rounded-sm object-cover block"
                    />
                  </td>
                  <td className={`py-1.5 pr-3 text-sm ${isMex ? 'text-green font-bold' : ''}`}
                      style={{ maxWidth: 0, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {team.name}
                  </td>
                  <td className="py-1.5 text-xs tabular-nums text-muted text-center px-3 hidden sm:table-cell">{s.pj > 0 ? s.pj : '–'}</td>
                  <td className="py-1.5 text-xs tabular-nums text-muted text-center px-3">{gdStr}</td>
                  <td className="py-1.5 text-sm font-bold tabular-nums text-center px-3">{s.pts}</td>
                  <td className="py-1.5 pl-2">
                    <div className="w-24">
                      <ProbBar pct={pQ} height={4} showLabel />
                    </div>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
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

function EscenariosTab() {
  const { results: realResults, discipline } = useApp();
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [hypoScores, setHypoScores] = useState({});

  const fixtures = useMemo(() => {
    return (FIXTURES_BY_GROUP[selectedGroup] ?? []).filter(f => f.matchday === 3);
  }, [selectedGroup]);

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

      <div className="flex flex-wrap gap-2">
        {Object.keys(GROUPS).map(g => (
          <button key={g} onClick={() => { setSelectedGroup(g); setHypoScores({}); }}
            className={`px-3 py-1 rounded text-sm font-mono transition-colors ${selectedGroup === g ? 'bg-green text-bg font-bold' : 'bg-card2 text-muted hover:text-text border border-border'}`}>
            {g === 'A' ? '🇲🇽 A' : `Grupo ${g}`}
          </button>
        ))}
      </div>

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

export default function Groups() {
  const [activeTab, setActiveTab] = useState('tablas');

  return (
    <div className="space-y-4">
      <div>
        <div className="tag mb-1">Fase de grupos · 12 grupos · 48 equipos</div>
        <h1 className="text-xl font-bold">Grupos</h1>
      </div>

      <div className="flex gap-1 border-b border-border">
        {[
          { key: 'tablas',     label: 'Tablas' },
          { key: 'terceros',   label: 'Mejores terceros' },
          { key: 'escenarios', label: 'Escenarios' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${activeTab === tab.key ? 'text-blue font-bold border-blue' : 'text-muted border-transparent hover:text-text'}`}>
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

      {activeTab === 'escenarios' && <EscenariosTab />}
    </div>
  );
}
