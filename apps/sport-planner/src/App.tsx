import { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Dialog } from '@headlessui/react';

import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import HomeView from './pages/HomeView';
import PlannerView from './pages/PlannerView';
import CatalogView from './pages/CatalogView';
import ObjectivesView from './pages/ObjectivesView';
import AssistantsView from './pages/AssistantsView';
import BackupsView from './pages/BackupsView';
import LoginView from './pages/LoginView';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/plan', label: 'Planificar' },
  { to: '/catalog', label: 'Trabajos' },
  { to: '/objectives', label: 'Objetivos' },
  { to: '/assistants', label: 'Asistentes' },
  { to: '/backups', label: 'Backups' }
];

function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('No se pudo cerrar sesión', error);
    } finally {
      setSigningOut(false);
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-base font-bold sm:h-10 sm:w-10 sm:text-lg">
            SP
          </div>
          <div>
            <p className="font-display text-lg font-semibold sm:text-xl">Sport Planner</p>
            <p className="text-[11px] text-white/50 sm:text-xs">Planifica sesiones increíbles</p>
          </div>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <nav className="flex items-center gap-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-lg shadow-sky-400/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <div className="text-right">
              <p className="text-xs text-white/50">Sesión iniciada</p>
              <p className="text-sm font-semibold text-white">
                {user?.email ?? 'Cuenta'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                void handleSignOut();
              }}
              disabled={signingOut}
              className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-60"
            >
              {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir navegación"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <Dialog open={mobileOpen} onClose={setMobileOpen} className="md:hidden">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <Dialog.Panel className="fixed inset-y-4 right-3 flex w-[17rem] flex-col rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-white">Navegación</p>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar navegación"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-white text-slate-900 shadow shadow-sky-400/40'
                      : 'text-white/80 hover:bg-white/10'
                  }`
                }
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">Sesión iniciada</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {user?.email ?? 'Cuenta'}
            </p>
            <button
              type="button"
              onClick={() => {
                void handleSignOut();
              }}
              disabled={signingOut}
              className="mt-3 w-full rounded-full border border-white/20 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-60"
            >
              {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}

function AppLayout() {
  useSupabaseSync();

  return (
    <div className="min-h-screen pb-16">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-sky-400" />
        <p className="text-sm font-medium text-white/60">Cargando Sport Planner…</p>
      </div>
    </div>
  );
}

function RequireAuth() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomeView />} />
            <Route path="plan" element={<PlannerView />} />
            <Route path="catalog" element={<CatalogView />} />
            <Route path="objectives" element={<ObjectivesView />} />
            <Route path="assistants" element={<AssistantsView />} />
            <Route path="backups" element={<BackupsView />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
