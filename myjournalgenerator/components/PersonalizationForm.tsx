
import React, { useState, useEffect } from 'react';
import { PersonalizationOptions, Tradition, LifeRole, JournalFormat, CentralObjective, EntryContentType } from '../types';
import { AVAILABLE_TRADITIONS, AVAILABLE_LIFE_ROLES, AVAILABLE_JOURNAL_FORMATS, AVAILABLE_CENTRAL_OBJECTIVES, AVAILABLE_ENTRY_CONTENT_TYPES } from '../constants';

interface PersonalizationFormProps {
  onSubmit: (options: PersonalizationOptions) => void;
  defaultOptions?: Partial<PersonalizationOptions>;
}

const TOTAL_STEPS = 8; // Increased total steps for summary

// Descriptions for options
const traditionDescriptions: Record<Tradition, string> = {
  [Tradition.STOICISM]: "Enfócate en la virtud, la razón y la serenidad ante lo que no puedes controlar.",
  [Tradition.ZEN_BUDDHISM]: "Descubre la paz en la simplicidad, la atención plena y la meditación.",
  [Tradition.CONTEMPLATIVE_CHRISTIANITY]: "Profundiza en tu fe a través de la oración silenciosa y la meditación en las escrituras.",
  [Tradition.POSITIVE_PSYCHOLOGY]: "Cultiva el bienestar y la resiliencia aplicando principios científicos sobre las fortalezas humanas.",
  [Tradition.SUFISM]: "Embárcate en un viaje místico de amor, devoción y conocimiento interior."
};

const lifeRoleDescriptions: Record<LifeRole, string> = {
  [LifeRole.NEW_PARENT]: "Navega los desafíos y alegrías de la paternidad/maternidad temprana, encontrando equilibrio.",
  [LifeRole.EDUCATOR]: "Encuentra inspiración y resiliencia en tu vocación de enseñar y fomentar un impacto positivo.",
  [LifeRole.CHILDLESS_COUPLE]: "Fortalece vuestro vínculo y explorad nuevas dimensiones de crecimiento personal y como pareja.",
  [LifeRole.SENIOR_GRANDPARENT]: "Disfruta esta etapa vital, compartiendo sabiduría y creando lazos significativos con tus nietos.",
  [LifeRole.ENTREPRENEUR]: "Impulsa tu visión con claridad y resiliencia, manejando la incertidumbre en tu camino.",
  [LifeRole.STUDENT]: "Optimiza tu aprendizaje, maneja la presión académica y descubre tus pasiones.",
  [LifeRole.ARTIST_CREATIVE]: "Supera bloqueos creativos, encuentra inspiración constante y cultiva tu expresión artística.",
  [LifeRole.CAREGIVER_ADULT]: "Encuentra fortaleza, compasión y autocuidado mientras brindas apoyo a tus seres queridos.",
  [LifeRole.PROFESSIONAL_TRANSITION]: "Navega cambios de carrera con confianza, descubriendo nuevas oportunidades.",
  [LifeRole.MARTIAL_ARTIST]: "Integra los principios de tu arte marcial en la vida diaria, cultivando disciplina y enfoque."
};

const journalFormatDescriptions: Record<JournalFormat, string> = {
  [JournalFormat.DAILY_MICRO]: "Entradas diarias breves para una introspección rápida y enfocada, ideal para mantener la constancia.",
  [JournalFormat.WEEKLY_LONG]: "Reflexiones semanales más profundas para analizar tu progreso y aprendizajes con mayor detalle.",
  [JournalFormat.YEARLY_FULL_365_DAYS]: "Un viaje completo de un año con una entrada diaria, perfecto para un compromiso profundo.",
  [JournalFormat.HERO_JOURNEY]: "Una narrativa de 30 días donde un protagonista (tu héroe) evoluciona superando desafíos. Ideal para un enfoque temático y transformador."
};

const entryContentTypeDescriptions: Record<EntryContentType, string> = {
  [EntryContentType.CONCISE_COMMENTARY]: "Breves reflexiones directas y al grano, ideales para extraer la esencia de una idea.",
  [EntryContentType.INSPIRATIONAL_NARRATIVE]: "Pequeñas historias o fábulas que transmiten sabiduría y motivación de forma amena.",
  [EntryContentType.HISTORICAL_ANECDOTE]: "Anécdotas de la historia que ilustran principios o lecciones aplicables a tu vida.",
  [EntryContentType.PHILOSOPHICAL_EXPLORATION]: "Análisis más extensos sobre conceptos filosóficos, invitando a una reflexión profunda."
};

const centralObjectiveDescriptions: Record<CentralObjective, string> = {
  [CentralObjective.STRESS_MANAGEMENT]: "Aprende técnicas para reducir el estrés y encontrar calma en tu día a día.",
  [CentralObjective.CULTIVATE_PATIENCE]: "Desarrolla la capacidad de mantener la serenidad ante los desafíos y esperas.",
  [CentralObjective.FAMILY_GRATITUDE]: "Enfócate en apreciar y agradecer los lazos familiares, fortaleciendo tus relaciones.",
  [CentralObjective.DISCIPLINE_NO_GUILT]: "Construye hábitos positivos desde la autoaceptación, no desde la culpa.",
  [CentralObjective.FINDING_PURPOSE]: "Explora tus valores para descubrir o reafirmar tu propósito vital y profesional.",
  [CentralObjective.IMPROVING_RELATIONSHIPS]: "Desarrolla habilidades para comunicarte mejor y construir relaciones más sanas.",
  [CentralObjective.CREATIVITY_INSPIRATION]: "Desbloquea tu potencial creativo y encuentra nuevas fuentes de inspiración.",
  [CentralObjective.MINDFULNESS_PRESENCE]: "Aprende a vivir el momento presente con mayor atención y paz interior.",
  [CentralObjective.PERSONAL_GROWTH]: "Embárcate en un viaje de autodescubrimiento para entenderte mejor y potenciarte.",
  [CentralObjective.LEADERSHIP_IMPACT]: "Fortalece tus habilidades de liderazgo e influye positivamente en tu entorno."
};


const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex justify-center items-center mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          <div
            className={`w-3 h-3 rounded-full mx-1 ${
              index + 1 <= currentStep ? 'bg-sky-600' : 'bg-slate-300'
            }`}
          ></div>
          {index < totalSteps - 1 && (
            <div
              className={`h-0.5 w-6 ${
                index + 1 < currentStep ? 'bg-sky-600' : 'bg-slate-300'
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const FormSection: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="mb-6 p-4 border border-slate-300 rounded-lg bg-white shadow">
    <h3 className="text-xl font-semibold text-sky-700 mb-2">{title}</h3>
    {description && <p className="text-sm text-slate-600 mb-4">{description}</p>}
    {children}
  </div>
);

const PersonalizationForm: React.FC<PersonalizationFormProps> = ({ onSubmit, defaultOptions }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Traditions
  const defaultTraditions = defaultOptions?.traditions || [AVAILABLE_TRADITIONS[0]];
  const initialSelectedTraditions = defaultTraditions.filter(t => AVAILABLE_TRADITIONS.includes(t as Tradition)) as Tradition[];
  const initialCustomTradition = defaultTraditions.find(t => typeof t === 'string' && !AVAILABLE_TRADITIONS.includes(t as Tradition)) as string || '';
  const [selectedTraditions, setSelectedTraditions] = useState<Tradition[]>(initialSelectedTraditions);
  const [customTradition, setCustomTradition] = useState<string>(initialCustomTradition);

  // Life Role
  const defaultLifeRole = defaultOptions?.lifeRole || AVAILABLE_LIFE_ROLES[0];
  const initialLifeRoleEnum = typeof defaultLifeRole === 'string' && AVAILABLE_LIFE_ROLES.includes(defaultLifeRole as LifeRole) ? defaultLifeRole as LifeRole : undefined;
  const initialCustomLifeRole = typeof defaultLifeRole === 'string' && !AVAILABLE_LIFE_ROLES.includes(defaultLifeRole as LifeRole) ? defaultLifeRole : '';
  const [lifeRole, setLifeRole] = useState<LifeRole | undefined>(initialLifeRoleEnum);
  const [customLifeRole, setCustomLifeRole] = useState<string>(initialCustomLifeRole);
  
  const [journalFormat, setJournalFormat] = useState<JournalFormat>(defaultOptions?.journalFormat || AVAILABLE_JOURNAL_FORMATS[0]);
  const [heroProfile, setHeroProfile] = useState<string>(defaultOptions?.heroProfile || '');

  // Central Objectives
  const defaultObjectives = defaultOptions?.centralObjectives || [AVAILABLE_CENTRAL_OBJECTIVES[0]];
  const initialSelectedObjectives = defaultObjectives.filter(o => AVAILABLE_CENTRAL_OBJECTIVES.includes(o as CentralObjective)) as CentralObjective[];
  const initialCustomObjective = defaultObjectives.find(o => typeof o === 'string' && !AVAILABLE_CENTRAL_OBJECTIVES.includes(o as CentralObjective)) as string || '';
  const [selectedCentralObjectives, setSelectedCentralObjectives] = useState<CentralObjective[]>(initialSelectedObjectives);
  const [customCentralObjective, setCustomCentralObjective] = useState<string>(initialCustomObjective);
  
  const [defaultEntryContentType, setDefaultEntryContentType] = useState<EntryContentType>(defaultOptions?.defaultEntryContentType || AVAILABLE_ENTRY_CONTENT_TYPES[0]);
  const [generateIllustrations, setGenerateIllustrations] = useState<boolean>(defaultOptions?.generateIllustrations || false);


  const handleTraditionChange = (tradition: Tradition) => {
    setSelectedTraditions(prev =>
      prev.includes(tradition)
        ? prev.filter(t => t !== tradition)
        : [...prev, tradition]
    );
  };

  const handleLifeRoleRadioChange = (selectedRole: LifeRole) => {
    setLifeRole(selectedRole);
    setCustomLifeRole('');
  };

  const handleCustomLifeRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomLifeRole(e.target.value);
    if (e.target.value) {
      setLifeRole(undefined); 
    }
  };

  const handleObjectiveChange = (objective: CentralObjective) => {
    setSelectedCentralObjectives(prev =>
      prev.includes(objective)
        ? prev.filter(o => o !== objective)
        : [...prev, objective]
    );
  };

  const nextStep = () => {
    if (currentStep === 1 && selectedTraditions.length === 0 && customTradition.trim() === '') {
      alert("Por favor, selecciona al menos una tradición o escribe una personalizada.");
      return;
    }
     if (currentStep === 2 && !lifeRole && customLifeRole.trim() === '') {
      alert("Por favor, selecciona un rol vital o escribe uno personalizado.");
      return;
    }
    if (currentStep === 4 && journalFormat === JournalFormat.HERO_JOURNEY && heroProfile.trim() === '') {
      alert("Por favor, describe el perfil de tu héroe para el formato 'Camino del Héroe'.");
      return;
    }
    if (currentStep === 6 && selectedCentralObjectives.length === 0 && customCentralObjective.trim() === '') {
      alert("Por favor, selecciona al menos un objetivo central o escribe uno personalizado.");
      return;
    }
    // No validation needed for step 7 (Toques Finales) before going to summary (step 8)
    if (currentStep < TOTAL_STEPS) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validations should already have been passed by the "Siguiente" buttons or exist in this function for final check
    const finalTraditions: (Tradition | string)[] = [...selectedTraditions];
    if (customTradition.trim()) finalTraditions.push(customTradition.trim());

    const finalLifeRole: LifeRole | string = customLifeRole.trim() || lifeRole || AVAILABLE_LIFE_ROLES[0];

    const finalCentralObjectives: (CentralObjective | string)[] = [...selectedCentralObjectives];
    if (customCentralObjective.trim()) finalCentralObjectives.push(customCentralObjective.trim());

    if (finalTraditions.length === 0) {
      alert("Asegúrate de haber seleccionado o añadido una tradición.");
      setCurrentStep(1); return;
    }
    if (!finalLifeRole) { 
        alert("Por favor, selecciona o añade un rol vital.");
        setCurrentStep(2); return;
    }
     if (journalFormat === JournalFormat.HERO_JOURNEY && heroProfile.trim() === '') {
      alert("El perfil del héroe es necesario para el formato 'Camino del Héroe'.");
      setCurrentStep(4); return;
    }
    if (finalCentralObjectives.length === 0) {
      alert("Asegúrate de haber seleccionado o añadido un objetivo central.");
      setCurrentStep(6); return;
    }

    onSubmit({
      traditions: finalTraditions,
      lifeRole: finalLifeRole,
      journalFormat,
      heroProfile: journalFormat === JournalFormat.HERO_JOURNEY ? heroProfile.trim() : undefined,
      centralObjectives: finalCentralObjectives,
      defaultEntryContentType,
      generateIllustrations,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-3xl font-bold text-center text-sky-800 mb-6">Configura tu Diario Personalizado</h2>
      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <FormSection title="Paso 1: Tradiciones y Filosofías" description="Elige las corrientes de pensamiento que resonarán en tu diario. Puedes seleccionar varias y/o añadir una propia.">
            <div className="space-y-3">
              {AVAILABLE_TRADITIONS.map(trad => (
                <div key={trad} className="p-3 border border-slate-200 rounded-md hover:bg-sky-50 transition-colors">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTraditions.includes(trad)}
                      onChange={() => handleTraditionChange(trad)}
                      className="form-checkbox h-5 w-5 text-sky-600 rounded focus:ring-sky-500 mt-1"
                      aria-describedby={`tradition-desc-${trad}`}
                    />
                    <div>
                      <span id={`tradition-title-${trad}`} className="font-medium text-slate-700">{trad}</span>
                      <p id={`tradition-desc-${trad}`} className="text-xs text-slate-500 mt-0.5">{traditionDescriptions[trad]}</p>
                    </div>
                  </label>
                </div>
              ))}
              <div key="custom-tradition-wrapper" className="p-3 border border-slate-200 rounded-md">
                 <label htmlFor="customTradition" className="block text-sm font-medium text-slate-700 mb-1">Otra tradición/filosofía (opcional):</label>
                 <input
                    key="customTraditionInput"
                    type="text"
                    id="customTradition"
                    value={customTradition}
                    onChange={(e) => setCustomTradition(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Ej: Mindfulness secular, Humanismo..."
                 />
                 <p className="text-xs text-slate-500 mt-1">Si tu filosofía guía no está en la lista, añádela aquí.</p>
              </div>
            </div>
             {(selectedTraditions.length === 0 && customTradition.trim() === '') && <p className="text-red-500 text-sm mt-2">Debes seleccionar o añadir al menos una tradición.</p>}
          </FormSection>
        )}

        {currentStep === 2 && (
          <FormSection title="Paso 2: Rol Vital" description="Selecciona el rol que mejor describe tu etapa o enfoque actual, o especifica uno propio.">
            <div className="space-y-3">
              {AVAILABLE_LIFE_ROLES.map(r => (
                <div key={r} className="p-3 border border-slate-200 rounded-md hover:bg-sky-50 transition-colors">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="lifeRole"
                      value={r}
                      checked={lifeRole === r}
                      onChange={() => handleLifeRoleRadioChange(r)}
                      className="form-radio h-5 w-5 text-sky-600 focus:ring-sky-500 mt-1"
                      aria-describedby={`role-desc-${r}`}
                    />
                    <div>
                      <span id={`role-title-${r}`} className="font-medium text-slate-700">{r}</span>
                      <p id={`role-desc-${r}`} className="text-xs text-slate-500 mt-0.5">{lifeRoleDescriptions[r]}</p>
                    </div>
                  </label>
                </div>
              ))}
              <div key="custom-life-role-wrapper" className="p-3 border border-slate-200 rounded-md">
                 <label htmlFor="customLifeRole" className="block text-sm font-medium text-slate-700 mb-1">Otro rol vital (opcional):</label>
                 <input
                    key="customLifeRoleInput"
                    type="text"
                    id="customLifeRole"
                    value={customLifeRole}
                    onChange={handleCustomLifeRoleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Ej: Nómada digital, Jubilado activo..."
                 />
                 <p className="text-xs text-slate-500 mt-1">Si tu rol no está listado, puedes escribirlo aquí. Esto anulará la selección anterior.</p>
              </div>
            </div>
             {(!lifeRole && customLifeRole.trim() === '') && <p className="text-red-500 text-sm mt-2">Debes seleccionar o añadir un rol vital.</p>}
          </FormSection>
        )}

        {currentStep === 3 && (
          <FormSection title="Paso 3: Formato del Diario" description="Define la estructura y frecuencia de tus entradas.">
            <div className="space-y-3">
              {AVAILABLE_JOURNAL_FORMATS.map(format => (
                <div key={format} className="p-3 border border-slate-200 rounded-md hover:bg-sky-50 transition-colors">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="journalFormat"
                      value={format}
                      checked={journalFormat === format}
                      onChange={e => setJournalFormat(e.target.value as JournalFormat)}
                      className="form-radio h-5 w-5 text-sky-600 focus:ring-sky-500 mt-1"
                      aria-describedby={`format-desc-${format}`}
                    />
                    <div>
                      <span id={`format-title-${format}`} className="font-medium text-slate-700">{format}</span>
                      <p id={`format-desc-${format}`} className="text-xs text-slate-500 mt-0.5">{journalFormatDescriptions[format]}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </FormSection>
        )}
        
        {currentStep === 4 && journalFormat === JournalFormat.HERO_JOURNEY && (
          <FormSection title="Paso 4: Perfil del Héroe" description="Describe a tu héroe: quién es, su contexto y el desafío principal que enfrenta al inicio de esta historia de 30 pasos.">
            <textarea
              id="heroProfile"
              key="heroProfileTextarea"
              value={heroProfile}
              onChange={e => setHeroProfile(e.target.value)}
              rows={5}
              className="mt-1 block w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm resize-y"
              placeholder="Ej: 'Elara, una joven artesana en una aldea olvidada, lucha contra la apatía y un antiguo mal que amenaza con consumir la creatividad de su gente. Su desafío es redescubrir la magia ancestral y reavivar la esperanza.'"
              aria-label="Perfil del Héroe"
            />
            {heroProfile.trim() === '' && <p className="text-red-500 text-sm mt-2">El perfil del héroe es necesario para este formato.</p>}
          </FormSection>
        )}
        
        {currentStep === 4 && journalFormat !== JournalFormat.HERO_JOURNEY && (
             <></> // This step is skipped, logic in button handles it.
        )}


        {currentStep === 5 && (
          <FormSection title="Paso 5: Tipo de Contenido Principal" description="Escoge el estilo predominante para el contenido generado por la IA en tus entradas.">
             <div className="space-y-3">
              {AVAILABLE_ENTRY_CONTENT_TYPES.map(type => (
                <div key={type} className="p-3 border border-slate-200 rounded-md hover:bg-sky-50 transition-colors">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="defaultEntryContentType"
                      value={type}
                      checked={defaultEntryContentType === type}
                      onChange={e => setDefaultEntryContentType(e.target.value as EntryContentType)}
                      className="form-radio h-5 w-5 text-sky-600 focus:ring-sky-500 mt-1"
                      aria-describedby={`content-type-desc-${type}`}
                    />
                     <div>
                      <span id={`content-type-title-${type}`} className="font-medium text-slate-700">{type}</span>
                      <p id={`content-type-desc-${type}`} className="text-xs text-slate-500 mt-0.5">{entryContentTypeDescriptions[type]}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </FormSection>
        )}

        {currentStep === 6 && (
          <FormSection title="Paso 6: Objetivos Centrales" description="Define las metas o áreas de enfoque. El diario te ofrecerá perspectivas y desafíos alineados. Selecciona o añade los que desees.">
            <div className="space-y-3">
              {AVAILABLE_CENTRAL_OBJECTIVES.map(obj => (
                <div key={obj} className="p-3 border border-slate-200 rounded-md hover:bg-sky-50 transition-colors">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCentralObjectives.includes(obj)}
                      onChange={() => handleObjectiveChange(obj)}
                      className="form-checkbox h-5 w-5 text-sky-600 rounded focus:ring-sky-500 mt-1"
                      aria-describedby={`objective-desc-${obj}`}
                    />
                     <div>
                      <span id={`objective-title-${obj}`} className="font-medium text-slate-700">{obj}</span>
                      <p id={`objective-desc-${obj}`} className="text-xs text-slate-500 mt-0.5">{centralObjectiveDescriptions[obj]}</p>
                    </div>
                  </label>
                </div>
              ))}
              <div key="custom-central-objective-wrapper" className="p-3 border border-slate-200 rounded-md">
                 <label htmlFor="customCentralObjective" className="block text-sm font-medium text-slate-700 mb-1">Otro objetivo central (opcional):</label>
                 <input
                    key="customCentralObjectiveInput"
                    type="text"
                    id="customCentralObjective"
                    value={customCentralObjective}
                    onChange={(e) => setCustomCentralObjective(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Ej: Mejorar mi salud física, Aprender un idioma..."
                 />
                 <p className="text-xs text-slate-500 mt-1">Si tienes un objetivo específico no listado, ingrésalo aquí.</p>
              </div>
            </div>
            {(selectedCentralObjectives.length === 0 && customCentralObjective.trim() === '') && <p className="text-red-500 text-sm mt-2">Debes seleccionar o añadir al menos un objetivo.</p>}
          </FormSection>
        )}

        {currentStep === 7 && (
           <FormSection title="Paso 7: Toques Finales" description="Configura las últimas opciones antes de revisar el resumen. Las ilustraciones pueden añadir una dimensión visual única.">
            <label className="flex items-center space-x-2 p-3 border border-slate-200 rounded-md hover:bg-sky-50 cursor-pointer mb-6 transition-colors">
              <input
                type="checkbox"
                checked={generateIllustrations}
                onChange={e => setGenerateIllustrations(e.target.checked)}
                className="form-checkbox h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                aria-describedby="generate-illustrations-desc"
              />
              <div>
                <span id="generate-illustrations-label" className="font-medium text-slate-700">Incluir ilustraciones generadas por IA</span>
                <p id="generate-illustrations-desc" className="text-xs text-slate-500 mt-0.5">Si marcas esta opción, se intentará generar una imagen única para acompañar cada entrada y la portada.</p>
              </div>
            </label>
            <p className="text-sm text-slate-600 mb-4">Casi listo. En el siguiente paso podrás revisar todas tus elecciones.</p>
          </FormSection>
        )}

        {currentStep === TOTAL_STEPS && ( // New Step 8: Summary
          <FormSection title="Paso 8: Resumen y Confirmación" description="Revisa tus elecciones antes de generar el diario.">
            <div className="space-y-4 p-4 bg-slate-50 rounded-md">
              <div>
                <p className="text-sm font-semibold text-slate-500">Tradiciones/Filosofías:</p>
                <p className="text-slate-700">{selectedTraditions.join(', ') || 'Ninguna predefinida'}{customTradition ? (selectedTraditions.length > 0 ? ', ' : '') + `Personalizada: ${customTradition}` : (selectedTraditions.length === 0 ? 'Ninguna' : '')}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Rol Vital:</p>
                <p className="text-slate-700">{customLifeRole || lifeRole || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Formato del Diario:</p>
                <p className="text-slate-700">{journalFormatDescriptions[journalFormat]} ({journalFormat})</p>
              </div>
              {journalFormat === JournalFormat.HERO_JOURNEY && heroProfile && (
                <div>
                  <p className="text-sm font-semibold text-slate-500">Perfil del Héroe:</p>
                  <p className="text-slate-700 whitespace-pre-wrap">{heroProfile}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-500">Tipo de Contenido Principal:</p>
                <p className="text-slate-700">{entryContentTypeDescriptions[defaultEntryContentType]} ({defaultEntryContentType})</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Objetivos Centrales:</p>
                <p className="text-slate-700">{selectedCentralObjectives.join(', ') || 'Ninguno predefinido'}{customCentralObjective ? (selectedCentralObjectives.length > 0 ? ', ' : '') + `Personalizado: ${customCentralObjective}` : (selectedCentralObjectives.length === 0 ? 'Ninguno' : '')}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Generar Ilustraciones:</p>
                <p className="text-slate-700">{generateIllustrations ? 'Sí' : 'No'}</p>
              </div>
            </div>
             <p className="text-sm text-slate-600 mt-6 mb-4">Si todo está correcto, ¡haz clic abajo para crear tu diario personalizado!</p>
          </FormSection>
        )}


        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => {
                 if (currentStep === 5 && journalFormat !== JournalFormat.HERO_JOURNEY) {
                   // If coming back from step 5 and it's not Hero's journey, step 4 was skipped, so go to step 3.
                   setCurrentStep(3);
                 } else {
                   prevStep();
                 }
              }}
              className="bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
              Anterior
            </button>
          )}
          {currentStep < TOTAL_STEPS && (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 3 && journalFormat !== JournalFormat.HERO_JOURNEY) {
                  // Skip step 4 (Hero Profile) if not Hero's Journey format
                  setCurrentStep(5); 
                } else {
                  nextStep();
                }
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out ml-auto"
              disabled={
                (currentStep === 1 && selectedTraditions.length === 0 && customTradition.trim() === '') ||
                (currentStep === 2 && !lifeRole && customLifeRole.trim() === '') ||
                (currentStep === 4 && journalFormat === JournalFormat.HERO_JOURNEY && heroProfile.trim() === '') ||
                (currentStep === 6 && selectedCentralObjectives.length === 0 && customCentralObjective.trim() === '')
              }
            >
              Siguiente
            </button>
          )}
          {currentStep === TOTAL_STEPS && ( // Submit button now on the last step (summary)
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ml-auto"
            >
              Generar Índice del Diario
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PersonalizationForm;
