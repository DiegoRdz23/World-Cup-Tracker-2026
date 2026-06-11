import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase';
import { runMonteCarlo } from './model/simulation';
import Home    from './pages/Home';
import Mexico  from './pages/Mexico';
import Groups  from './pages/Groups';
import Admin   from './pages/Admin';

// ─── Context ─────────────────────────────────────────────────────────────────
export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// ─── Navigation ──────────────────────────────────────────────────────────────
function Nav() {
  const { pathname } = useLocation();
  const links = [
    { to: '/',        label: 'Campeón' },
    { to: '/mexico',  label: '🇲🇽 México' },
    { to: '/grupos',  label: 'Grupos' },
    { to: '/admin',   label: 'Resultados' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-border">
      <div className="max-w-3xl mx-auto px-4 flex items-center gap-1 h-12 overflow-x-auto">
        <span className="text-green font-bold text-sm mr-3 whitespace-nowrap">⚽ MX26</span>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`px-3 py-1 rounded text-sm whitespace-nowrap transition-colors ${
              pathname === l.to
                ? 'bg-card2 text-white font-bold'
                : 'text-muted hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [results,  setResults]  = useState({});
  const [loading,  setLoading]  = useState(true);

  // Escuchar Firebase en tiempo real
  useEffect(() => {
    const r = ref(db, 'results');
    const unsub = onValue(r, snap => {
      setResults(snap.val() ?? {});
      setLoading(false);
    }, () => {
      // Si falla (sin config), continuar sin resultados
      setLoading(false);
    });
    return unsub;
  }, []);

  // Recalcular predicciones cada vez que cambian los resultados
  const predictions = useMemo(() => {
    return runMonteCarlo(results, 8000);
  }, [results]);

  return (
    <AppCtx.Provider value={{ results, predictions, loading }}>
      <div className="min-h-screen bg-bg text-white">
        <Nav />
        <main className="max-w-3xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-muted text-sm">
              Cargando…
            </div>
          ) : (
            <Routes>
              <Route path="/"        element={<Home />} />
              <Route path="/mexico"  element={<Mexico />} />
              <Route path="/grupos"  element={<Groups />} />
              <Route path="/admin"   element={<Admin />} />
            </Routes>
          )}
        </main>
      </div>
    </AppCtx.Provider>
  );
}
