import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../App';

export default function Login() {
  const { user } = useApp();
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Si ya tiene sesión activa, ir directo al admin
  if (user) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin', { replace: true });
    } catch {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="card2 w-full max-w-sm space-y-5 p-6">
        <div>
          <div className="tag mb-1">Acceso restringido</div>
          <h1 className="text-xl font-bold">Iniciar sesión</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="input-field w-full"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="input-field w-full"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green text-bg font-bold py-2 rounded text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {loading ? '…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
