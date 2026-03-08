import { useMemo, useState } from 'react';
import {
  BedDouble,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Compass,
  ChevronDown,
  ExternalLink,
  FileText,
  MapPinned,
  Phone,
  Plane,
  Sparkles,
  Star,
  Ticket,
} from 'lucide-react';
import { contacts, days, generalSupportCards, lockedMoments, mustSee, practicalNotes, tripDocs, tripMeta } from './data';

function App() {
  const [activeDayId, setActiveDayId] = useState(days[0].id);

  const activeDay = useMemo(
    () => days.find((day) => day.id === activeDayId) ?? days[0],
    [activeDayId],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--paper)] text-[var(--ink)]">
      <div className="page-glow page-glow-left" />
      <div className="page-glow page-glow-right" />

      <main className="mx-auto flex w-full min-w-0 max-w-[1500px] flex-col gap-6 px-4 pb-16 pt-4 sm:gap-8 sm:px-6 sm:pt-6 lg:px-8">
        <section className="hero-shell overflow-hidden rounded-[36px] border border-white/45 px-5 py-6 shadow-[0_30px_120px_rgba(43,32,24,0.16)] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted-strong)]">
                <span className="editorial-chip">
                  <Sparkles className="h-4 w-4" />
                  Guía familiar privada
                </span>
                <span className="editorial-chip">
                  <CalendarDays className="h-4 w-4" />
                  {tripMeta.dateRange}
                </span>
                <span className="editorial-chip">
                  <BedDouble className="h-4 w-4" />
                  {tripMeta.base}
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[var(--accent-deep)]">
                  Londres a fuego lento
                </p>
                <h1 className="hero-title max-w-4xl">
                  {tripMeta.title}
                  <span className="block text-[0.48em] font-semibold tracking-[0.02em] text-[var(--accent-soft)]">
                    {tripMeta.subtitle}
                  </span>
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
                  Una guía visual para llegar con el viaje ya vivido en la cabeza: qué está cerrado,
                  qué se ve cada día, por qué merece la pena cada parada y cómo moverse sin convertir
                  Londres en una carrera.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  icon={<Plane className="h-5 w-5" />}
                  label="Viajeros"
                  value={tripMeta.travellers}
                  note="2 adultos + 3 peques"
                />
                <StatCard
                  icon={<Compass className="h-5 w-5" />}
                  label="Centro de operaciones"
                  value="Kennington"
                  note="Base práctica para entrar y salir"
                />
                <StatCard
                  icon={<Ticket className="h-5 w-5" />}
                  label="Momentos cerrados"
                  value={`${lockedMoments.length}`}
                  note="Vuelos, transfers y entradas fijas"
                />
              </div>
            </div>

            <div className="rounded-[30px] border border-white/55 bg-[linear-gradient(160deg,rgba(124,71,39,0.08),rgba(255,255,255,0.72))] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--accent-deep)]">
                    Resumen táctico
                  </p>
                  <h2 className="mt-2 font-display text-2xl text-[var(--ink)]">Lo que ya manda</h2>
                </div>
                <div className="rounded-full border border-white/60 bg-white/55 p-3 text-[var(--accent-deep)]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {lockedMoments.map((moment) => (
                  <div
                    key={moment}
                    className="rounded-2xl border border-white/60 bg-white/65 px-4 py-3 text-sm leading-6 text-[var(--muted)] shadow-[0_10px_30px_rgba(98,67,44,0.08)]"
                  >
                    {moment}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid min-w-0 gap-4">
          <div className="min-w-0 rounded-[28px] border border-[var(--line)] bg-white/72 p-4 shadow-[0_20px_70px_rgba(43,32,24,0.08)] backdrop-blur-xl sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--accent-deep)]">
                  Itinerario completo
                </p>
                <h2 className="mt-2 font-display text-3xl text-[var(--ink)]">
                  Día a día, en modo guía
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Cada jornada combina logística real con lectura turística: qué ver primero, qué os
                cuenta la ciudad en cada tramo y dónde conviene bajar el ritmo.
              </p>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {days.map((day) => {
                const isActive = day.id === activeDay.id;
                return (
                  <button
                    key={`${day.id}-pill`}
                    type="button"
                    onClick={() => setActiveDayId(day.id)}
                    className={[
                      'shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition',
                      isActive
                        ? 'border-[var(--accent-soft)] bg-[var(--accent-deep)] text-white shadow-[0_12px_30px_rgba(66,42,30,0.22)]'
                        : 'border-[var(--line)] bg-white/78 text-[var(--muted)]',
                    ].join(' ')}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 hidden gap-3 lg:flex lg:overflow-x-auto lg:pb-1">
              {days.map((day) => {
                const isActive = day.id === activeDay.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setActiveDayId(day.id)}
                    className={[
                      'group min-w-[260px] rounded-[24px] border px-4 py-4 text-left transition duration-300',
                      isActive
                        ? 'border-[var(--accent-soft)] bg-[linear-gradient(180deg,rgba(110,66,46,0.95),rgba(54,34,25,0.97))] text-white shadow-[0_24px_50px_rgba(66,42,30,0.28)]'
                        : 'border-[var(--line)] bg-[rgba(255,255,255,0.68)] hover:-translate-y-0.5 hover:border-[var(--accent-soft)] hover:bg-white',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className={[
                            'text-xs font-semibold uppercase tracking-[0.24em]',
                            isActive ? 'text-white/70' : 'text-[var(--accent-deep)]',
                          ].join(' ')}
                        >
                          {day.label}
                        </p>
                        <h3 className="mt-2 break-words font-display text-2xl leading-tight">{day.subtitle}</h3>
                      </div>
                      <Star
                        className={[
                          'mt-1 h-5 w-5',
                          isActive ? 'text-[var(--gold)]' : 'text-[var(--accent-soft)]/70',
                        ].join(' ')}
                      />
                    </div>
                    <p className={['mt-3 text-sm leading-6', isActive ? 'text-white/82' : 'text-[var(--muted)]'].join(' ')}>
                      {day.date} · {day.theme}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <article className="rounded-[32px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,248,242,0.88))] p-5 shadow-[0_20px_90px_rgba(43,32,24,0.09)] sm:p-8">
              <div className="flex flex-col gap-6 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--accent-deep)]">
                    {activeDay.date}
                  </p>
                  <div>
                    <h2 className="font-display text-4xl leading-none text-[var(--ink)] sm:text-5xl">
                      {activeDay.subtitle}
                    </h2>
                    <p className="mt-3 max-w-3xl text-lg leading-8 text-[var(--muted)]">
                      {activeDay.summary}
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-[var(--line)] bg-white/78 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-deep)]">
                    Enfoque del día
                  </p>
                  <p className="mt-3 max-w-md text-base leading-7 text-[var(--muted)]">
                    {activeDay.highlight}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <Panel
                  eyebrow="Qué manda hoy"
                  title="Bloques fijos"
                  icon={<Clock3 className="h-5 w-5" />}
                  compact
                >
                  <ul className="space-y-2 text-sm leading-6 text-[var(--muted)]">
                    {activeDay.fixed.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Ticket className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-soft)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>

                <Panel eyebrow="Idea-fuerza" title={activeDay.theme} icon={<Sparkles className="h-5 w-5" />} compact>
                  <p className="text-sm leading-7 text-[var(--muted)]">
                    La jornada está construida para que la logística no compita con la experiencia.
                    Cada bloque tiene un propósito claro: entrar, mirar, disfrutar y seguir adelante
                    sin romper el ritmo del grupo.
                  </p>
                </Panel>
              </div>
            </article>

            <section className="min-w-0 space-y-5">
              {activeDay.stops.map((stop, index) => (
                <article
                  key={`${stop.time}-${stop.title}`}
                  className="timeline-card grid min-w-0 gap-5 overflow-hidden rounded-[30px] border border-[var(--line)] bg-white/78 p-4 shadow-[0_18px_60px_rgba(43,32,24,0.08)] backdrop-blur-xl sm:p-5 lg:grid-cols-[150px_minmax(0,1fr)]"
                >
                  <div className="flex flex-col justify-between gap-4 rounded-[24px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(247,236,225,0.95),rgba(255,255,255,0.82))] p-4">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[var(--accent-deep)]">
                        Parada {String(index + 1).padStart(2, '0')}
                      </p>
                      <p className="mt-3 font-mono text-2xl text-[var(--ink)]">{stop.time}</p>
                    </div>
                    <p className="text-sm leading-6 text-[var(--muted)]">{stop.area}</p>
                  </div>

                  <div className="min-w-0 space-y-5">
                    <div className="space-y-3">
                      <h3 className="font-display text-3xl leading-tight text-[var(--ink)]">{stop.title}</h3>
                      <p className="max-w-4xl text-lg leading-8 text-[var(--muted)]">{stop.narrative}</p>
                    </div>

                    {stop.image ? (
                      <JourneyImage src={stop.image} alt={stop.imageAlt ?? stop.title} />
                    ) : null}

                    {stop.details?.length ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {stop.details.map((detail) => (
                          <div
                            key={detail}
                            className="rounded-[22px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,240,232,0.86))] px-4 py-4 text-sm leading-7 text-[var(--muted)]"
                          >
                            {detail}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <SupportCards cards={stop.supportCards ?? []} />
                    <DocLinks links={stop.links ?? []} />

                    <div className="grid gap-3 lg:grid-cols-2">
                      {stop.reservation ? (
                        <InfoBand
                          icon={<Ticket className="h-4 w-4" />}
                          label="Reserva / bloque fijo"
                          content={stop.reservation}
                        />
                      ) : null}
                      {stop.practical ? (
                        <InfoBand
                          icon={<Compass className="h-4 w-4" />}
                          label="Nota operativa"
                          content={stop.practical}
                        />
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </div>

          <aside className="min-w-0 space-y-4">
            <Panel eyebrow="Documentación" title="Acceso rápido" icon={<FileText className="h-5 w-5" />}>
              <DocLinks links={tripDocs} />
            </Panel>

            <Panel eyebrow="Operativa viva" title="Tarjetas útiles" icon={<Compass className="h-5 w-5" />}>
              <SupportCards cards={generalSupportCards} />
            </Panel>

            <Panel
              eyebrow="Checklist emocional"
              title="Imprescindibles"
              icon={<Camera className="h-5 w-5" />}
            >
              <ul className="space-y-2 text-sm leading-6 text-[var(--muted)]">
                {mustSee.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-soft)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel eyebrow="Notas vivas" title="Operativa" icon={<MapPinned className="h-5 w-5" />}>
              <ul className="space-y-3 text-sm leading-6 text-[var(--muted)]">
                {practicalNotes.map((note) => (
                  <li key={note} className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3">
                    {note}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel eyebrow="Siempre a mano" title="Contactos rápidos" icon={<Phone className="h-5 w-5" />}>
              <ul className="space-y-3">
                {contacts.map((contact) => (
                  <li
                    key={`${contact.label}-${contact.value}`}
                    className="rounded-[22px] border border-[var(--line)] bg-white/74 px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-[var(--ink)]">{contact.label}</p>
                    <p className="mt-1 font-mono text-sm text-[var(--accent-deep)]">{contact.value}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{contact.note}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel eyebrow="Mapa mental" title="Cómo leer este viaje" icon={<Sparkles className="h-5 w-5" />}>
              <div className="space-y-4 text-sm leading-7 text-[var(--muted)]">
                <p>
                  El esquema no está pensado para hacer “todo Londres”, sino para encadenar muy bien
                  cada jornada: iconos, barrios, descansos y logística sin pasos tontos.
                </p>
                <p>
                  Si un bloque se cae por cansancio o clima, la estructura general sigue aguantando.
                  Eso hace que el viaje sea más bonito y también más robusto.
                </p>
              </div>
            </Panel>
          </aside>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/60 bg-white/68 p-4 shadow-[0_16px_40px_rgba(77,55,40,0.08)] backdrop-blur-xl">
      <div className="flex items-center gap-3 text-[var(--accent-deep)]">
        <div className="rounded-full border border-[var(--line)] bg-[var(--mist)] p-2">{icon}</div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em]">{label}</p>
      </div>
      <p className="mt-4 font-display text-3xl text-[var(--ink)]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{note}</p>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  icon,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={[
        'rounded-[28px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(251,244,237,0.88))] shadow-[0_18px_60px_rgba(43,32,24,0.08)]',
        compact ? 'p-4 sm:p-5' : 'p-5',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--accent-deep)]">
            {eyebrow}
          </p>
          <h3 className="mt-2 font-display text-2xl text-[var(--ink)]">{title}</h3>
        </div>
        <div className="rounded-full border border-[var(--line)] bg-white/75 p-3 text-[var(--accent-deep)]">
          {icon}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoBand({
  icon,
  label,
  content,
}: {
  icon: React.ReactNode;
  label: string;
  content: string;
}) {
  return (
    <div className="rounded-[22px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(112,69,49,0.08),rgba(255,255,255,0.9))] px-4 py-4">
      <div className="flex items-center gap-2 text-[var(--accent-deep)]">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.24em]">{label}</span>
      </div>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{content}</p>
    </div>
  );
}

function DocLinks({ links }: { links: { label: string; href: string; external?: boolean }[] }) {
  if (!links.length) return null;

  return (
    <div className="rounded-[22px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,240,232,0.88))] px-4 py-4">
      <div className="flex items-center gap-2 text-[var(--accent-deep)]">
        <FileText className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.24em]">Detalles y docs</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={`${link.label}-${link.href}`}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/88 px-3 py-2 text-sm text-[var(--muted)] transition hover:-translate-y-0.5 hover:border-[var(--accent-soft)] hover:text-[var(--accent-deep)]"
          >
            <span>{link.label}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </div>
  );
}

function SupportCards({
  cards,
}: {
  cards: { title: string; summary: string; bullets?: string[] }[];
}) {
  if (!cards.length) return null;

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <details
          key={`${card.title}-${card.summary}`}
          className="support-card group overflow-hidden rounded-[22px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(247,238,230,0.9))]"
        >
          <summary className="support-card-summary flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 rounded-full border border-[var(--line)] bg-[var(--mist)] p-2 text-[var(--accent-deep)]">
                <Compass className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[var(--accent-deep)]">
                  Apoyo rápido
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{card.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{card.summary}</p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--accent-deep)] transition group-open:rotate-180" />
          </summary>
          {card.bullets?.length ? (
            <div className="support-card-body border-t border-[var(--line)] px-4 py-4">
              <ul className="space-y-2 text-sm leading-6 text-[var(--muted)]">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-soft)]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </details>
      ))}
    </div>
  );
}

function JourneyImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <figure className="overflow-hidden rounded-[26px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(244,228,210,0.95),rgba(255,255,255,0.92))]">
        <div className="flex h-[240px] flex-col items-center justify-center gap-3 px-6 text-center sm:h-[330px]">
          <div className="rounded-full border border-[var(--line)] bg-white/70 p-3 text-[var(--accent-deep)]">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[var(--accent-deep)]">
              Imagen no disponible
            </p>
            <p className="mt-2 text-base leading-7 text-[var(--muted)]">{alt}</p>
          </div>
        </div>
      </figure>
    );
  }

  return (
    <figure className="overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--mist)]">
      <img
        src={src}
        alt={alt}
        className="h-[240px] w-full object-cover sm:h-[330px]"
        loading="lazy"
        onError={() => setFailed(true)}
      />
      <figcaption className="flex flex-col items-start gap-2 px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)] sm:flex-row sm:items-center sm:justify-between">
        <span>{alt}</span>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[var(--accent-deep)] transition hover:text-[var(--accent-soft)]"
        >
          abrir imagen
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </figcaption>
    </figure>
  );
}

export default App;
