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
        className="w-full bg-card2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-green/50"
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
                          : 'bg-blue/10 border-blue/40 text-blue font-bold'
                        : 'bg-card2 border-border text-muted hover:text-text'
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
