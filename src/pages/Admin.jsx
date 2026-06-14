import { useState } from 'react';
import { ref, set } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useApp } from '../App';
import { TEAMS, GROUPS } from '../data/teams';
import { FIXTURES_BY_GROUP } from '../data/fixtures';

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

function DisciplineTeamRow({ team, code, matchId, initialD, onSave, savedKey }) {
  const [y, setY] = useState(String(initialD.yellow ?? 0));
  const [r, setR] = useState(String(initialD.red ?? 0));
  const key = `${code}_${matchId}`;
  return (
    <div className="flex items-center gap-3">
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
        onClick={() => onSave(code, matchId, parseInt(y) || 0, parseInt(r) || 0)}
        className={`text-xs font-bold px-2 py-1 rounded transition-all ${savedKey === key ? 'bg-green/20 text-green' : 'bg-card border border-border text-muted hover:text-white'}`}>
        {savedKey === key ? '✓' : 'OK'}
      </button>
    </div>
  );
}

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
              <DisciplineTeamRow team={home} code={f.home} matchId={f.id} initialD={dHome} onSave={saveDiscipline} savedKey={saved} />
              <DisciplineTeamRow team={away} code={f.away} matchId={f.id} initialD={dAway} onSave={saveDiscipline} savedKey={saved} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
