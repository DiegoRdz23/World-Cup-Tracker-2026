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
import Eliminatoria from './pages/Eliminatoria';
import Partidos     from './pages/Partidos';

// ─── Context ─────────────────────────────────────────────────────────────────
export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// ─── Ruta protegida (redirige a /login si no hay sesión) ─────────────────────
function ProtectedRoute({ children }) {
  const { user, authLoading } = useApp();
  if (authLoading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

// ─── Layout wrapper — cambia max-width según la ruta ─────────────────────────
function PageLayout({ children, loading }) {
  const { pathname } = useLocation();
  const wide = pathname === '/grupos' || pathname === '/eliminatoria';
  return (
    <main className={`mx-auto px-4 py-6 transition-all ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
      {loading ? (
        <div className="flex items-center justify-center h-48 text-muted text-sm">
          Cargando…
        </div>
      ) : children}
    </main>
  );
}

// ─── Ticker de predicciones en vivo ──────────────────────────────────────────
function Ticker() {
  const { predictions, loading } = useApp();

  const items = loading
    ? [{ label: 'Cargando predicciones…', code: null }]
    : Object.entries(predictions)
        .sort((a, b) => b[1].pChampion - a[1].pChampion)
        .slice(0, 8)
        .map(([code, p]) => ({
          code,
          label: `${Math.round(p.pChampion * 1000) / 10}% campeón`,
        }));

  // Duplicar para loop continuo
  const all = [...items, ...items];

  return (
    <div className="ticker-wrap">
      <div className="ticker-inner">
        {all.map((item, i) => (
          <span key={i} className="ticker-item">
            {item.code ? <b>{item.code}</b> : null}
            {item.code ? ' ' : null}
            {item.label}
            {i < all.length - 1 ? <span style={{ margin: '0 16px', opacity: 0.3 }}>·</span> : null}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function Nav() {
  const { pathname } = useLocation();
  const links = [
    { to: '/',             label: 'Campeón' },
    { to: '/mexico',       label: '🇲🇽 México' },
    { to: '/grupos',       label: 'Grupos' },
    { to: '/partidos',     label: 'Partidos' },
    { to: '/squads',       label: 'Squads' },
    { to: '/eliminatoria', label: 'Eliminatoria' },
    { to: '/admin',        label: 'Resultados' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b-2 border-border shadow-sm">
      <div className="max-w-3xl mx-auto px-4 flex items-center gap-1 h-12 overflow-x-auto">
        {/* Logo + live dot */}
        <div className="flex items-center gap-2 mr-3 shrink-0">
          <span
            className="w-2 h-2 rounded-full bg-red shrink-0"
            style={{ animation: 'livePulse 1.4s ease-in-out infinite' }}
          />
          <span
            className="font-display font-bold text-sm text-text whitespace-nowrap"
            style={{ letterSpacing: '0.15em' }}
          >
            MX26
          </span>
        </div>

        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`px-3 py-1 text-xs font-mono whitespace-nowrap transition-all border-b-2 ${
              pathname === l.to
                ? 'text-blue font-bold border-blue'
                : 'text-muted hover:text-text border-transparent'
            }`}
            style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
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
      <div className="min-h-screen bg-bg text-text">
        <Nav />
        <Ticker />
        <PageLayout loading={loading}>
          <Routes>
            <Route path="/"             element={<Home />} />
            <Route path="/mexico"       element={<Mexico />} />
            <Route path="/grupos"       element={<Groups />} />
            <Route path="/partidos"     element={<Partidos />} />
            <Route path="/squads"       element={<Squads />} />
            <Route path="/eliminatoria" element={<Eliminatoria />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/admin"        element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          </Routes>
        </PageLayout>
      </div>
    </AppCtx.Provider>
  );
}
