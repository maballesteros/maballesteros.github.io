import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Dialog } from '@headlessui/react';

import HomeView from './pages/HomeView';
import PlannerView from './pages/PlannerView';
import CatalogView from './pages/CatalogView';
import ObjectivesView from './pages/ObjectivesView';
import AssistantsView from './pages/AssistantsView';
import BackupsView from './pages/BackupsView';

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

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-lg font-bold">
            SP
          </div>
          <div>
            <p className="font-display text-xl font-semibold">Sport Planner</p>
            <p className="text-xs text-white/50">Planifica sesiones increíbles</p>
          </div>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
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
        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80"
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
        <Dialog.Panel className="fixed inset-y-4 right-4 flex w-72 flex-col rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl">
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
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen pb-16">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/plan" element={<PlannerView />} />
          <Route path="/catalog" element={<CatalogView />} />
          <Route path="/objectives" element={<ObjectivesView />} />
          <Route path="/assistants" element={<AssistantsView />} />
          <Route path="/backups" element={<BackupsView />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
