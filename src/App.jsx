import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';
import { runMonteCarlo } from './model/simulation';
import Home    from './pages/Home';
import Mexico  from './pages/Mexico';
import Groups  from './pages/Groups';
import Admin   from './pages/Admin';
import Login   from './pages/Login';
import Squads from './pages/Squads';

// ─── Context ─────────────────────────────────────────────────────────────────
export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// ─── Ruta protegida (redirige a /login si no hay sesión) ─────────────────────
function ProtectedRoute({ children }) {
  const { user, authLoading } = useApp();
  if (authLoading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function Nav() {
  const { pathname } = useLocation();
  const links = [
    { to: '/',        label: 'Campeón' },
    { to: '/mexico',  label: '🇲🇽 México' },
    { to: '/grupos',  label: 'Grupos' },
    { to: '/squads',  label: 'Squads' },
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
            className={`px-3 py-1 text-sm whitespace-nowrap transition-all border-b-2 ${
              pathname === l.to
                ? 'text-white font-bold border-green'
                : 'text-muted hover:text-white border-transparent'
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
  const [results,     setResults]     = useState({});
  const [loading,     setLoading]     = useState(true);
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [discipline,  setDiscipline]  = useState({});
  const [koResults,   setKoResults]   = useState({});

  // Escuchar Firebase en tiempo real
  useEffect(() => {
    const r = ref(db, 'results');
    const unsub = onValue(r, snap => {
      setResults(snap.val() ?? {});
      setLoading(false);
    }, () => {
      setLoading(false);
    });
    return unsub;
  }, []);

  // Escuchar tarjetas de disciplina en tiempo real
  useEffect(() => {
    const r = ref(db, 'discipline');
    const unsub = onValue(r, snap => {
      setDiscipline(snap.val() ?? {});
    });
    return unsub;
  }, []);

  // Escuchar resultados de fase eliminatoria en tiempo real
  useEffect(() => {
    const r = ref(db, 'ko_results');
    const unsub = onValue(r, snap => {
      setKoResults(snap.val() ?? {});
    });
    return unsub;
  }, []);

  // Escuchar estado de autenticación
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Recalcular predicciones cada vez que cambian los resultados
  const predictions = useMemo(() => {
    return runMonteCarlo(results, 8000);
  }, [results]);

  return (
    <AppCtx.Provider value={{ results, discipline, koResults, predictions, loading, user, authLoading }}>
      <div className="min-h-screen bg-bg text-white">
        <Nav />
        <main className="max-w-3xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-muted text-sm">
              Cargando…
            </div>
          ) : (
            <Routes>
              <Route path="/"       element={<Home />} />
              <Route path="/mexico" element={<Mexico />} />
              <Route path="/grupos"  element={<Groups />} />
              <Route path="/squads" element={<Squads />} />
              <Route path="/login"  element={<Login />} />
              <Route path="/admin"  element={
                <ProtectedRoute><Admin /></ProtectedRoute>
              } />
            </Routes>
          )}
        </main>
      </div>
    </AppCtx.Provider>
  );
}
