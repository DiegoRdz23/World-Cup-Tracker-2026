import { useState, useMemo } from 'react';
import { Fragment } from 'react';
import { useApp } from '../App';
import { TEAMS, GROUPS } from '../data/teams';
import { FIXTURES_BY_GROUP } from '../data/fixtures';
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

      <div className="flex gap-1 border-b border-border">
        {[
          { key: 'tablas',     label: 'Tablas' },
          { key: 'terceros',   label: 'Mejores terceros' },
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
