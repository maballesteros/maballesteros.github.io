import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

export default function LoginView() {
  const { signInWithPassword, signUpWithPassword, session, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!loading && session) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!email || !password) {
      setErrorMessage('Introduce tu email y contraseña.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    try {
      setSubmitting(true);
      if (mode === 'login') {
        await signInWithPassword(email, password);
      } else {
        await signUpWithPassword(email, password);
        setSuccessMessage('Revisa tu correo para confirmar la cuenta y vuelve a iniciar sesión.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo completar la operación.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-xl font-bold text-white">
            SP
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Accede a tus planes desde cualquier dispositivo con Supabase.
          </p>
        </header>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-white/50">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field w-full"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-white/50">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              className="input-field w-full"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wide text-white/50"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="input-field w-full"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full justify-center"
            disabled={submitting}
          >
            {submitting ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <footer className="mt-6 text-center text-sm text-white/60">
          {mode === 'login' ? (
            <button type="button" className="text-sky-300 hover:text-sky-200" onClick={toggleMode}>
              ¿No tienes cuenta? Regístrate
            </button>
          ) : (
            <button type="button" className="text-sky-300 hover:text-sky-200" onClick={toggleMode}>
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
