const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'App.tsx');
const content = fs.readFileSync(appPath, 'utf8');
const match = content.match(/const gruposTematicos:[\s\S]*?\n\];/);
if (!match) {
  throw new Error('No se pudo extraer gruposTematicos de App.tsx');
}
const literal = match[0]
  .replace(/const gruposTematicos: GrupoTematico\[] = /, '')
  .replace(/;$/, '');

const vm = require('vm');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext('result = ' + literal, sandbox);
const grupos = sandbox.result;

const groupTranslations = {
  'voc-kit-supervivencia': {
    name: 'School survival kit',
    description: 'Start your adventure with must-have words to navigate school safely.',
    levelTitle: 'Level 1 · Explorer',
    levelDescription: 'First contact with Spanish school life.'
  },
  'voc-vida-diaria': {
    name: 'Daily life in Spain',
    description: 'Expand your vocabulary to adapt to home routines and the city.',
    levelTitle: 'Level 2 · Urban explorer',
    levelDescription: 'Strengthen everyday habits and places.'
  },
  'voc-dominio-clase': {
    name: 'Class mastery',
    description: 'Master academic terms so you can participate with confidence and precision.',
    levelTitle: 'Level 3 · Classroom strategist',
    levelDescription: 'Reinforce academic and technical language.'
  },
  'voc-ocio-relaciones': {
    name: 'Leisure and connections',
    description: 'Connect with new friends by mastering social and cultural vocabulary.',
    levelTitle: 'Level 4 · Social adventurer',
    levelDescription: 'Interact fluently at activities and events.'
  },
  'voc-horizontes-futuros': {
    name: 'Future horizons',
    description: 'Get ready to talk about the future, technology, and your projects.',
    levelTitle: 'Level 5 · Visionary',
    levelDescription: 'Look ahead and expand your world in Spanish.'
  },
  'phr-primeros-dialogos': {
    name: 'First conversations',
    description: 'Build essential phrases to introduce yourself and solve basic situations.',
    levelTitle: 'Level 6 · Conversationalist',
    levelDescription: 'Take your first steps speaking in full sentences.'
  },
  'phr-clase-activa': {
    name: 'Active classroom',
    description: 'Take part in lessons with phrases that show initiative and teamwork.',
    levelTitle: 'Level 7 · Communication strategist',
    levelDescription: 'Coordinate tasks and solve doubts with classmates.'
  },
  'phr-vida-casa': {
    name: 'Life at home',
    description: 'Handle everyday life at home with phrases to stay organized and collaborate.',
    levelTitle: 'Level 8 · Home builder',
    levelDescription: 'Harmonize your family routines in Spanish.'
  },
  'phr-amistades-ocio': {
    name: 'Friends and fun',
    description: 'Strengthen relationships with invitations, opinions, and fun plans.',
    levelTitle: 'Level 9 · Social connector',
    levelDescription: 'Express your tastes and organize plans with confidence.'
  },
  'phr-ciudad-futuro': {
    name: 'City and future',
    description: 'Master advanced situations to move around the city and plan your future.',
    levelTitle: 'Level 10 · World storyteller',
    levelDescription: 'Reach your goals with high-impact Spanish.'
  }
};

const topicTranslations = {
  'objetos-basicos-aula': 'Classroom essentials',
  'personas-clave-instituto': 'Key people at school',
  'lugares-imprescindibles': 'Must-visit places',
  'comidas-rapidas': 'Quick meals',
  'emociones-basicas': 'Basic emotions',
  'numeros-colores': 'Numbers and colors',
  'rutinas-manana': 'Morning routines',
  'ropa-estaciones': 'Clothes for every season',
  'espacios-hogar': 'Home spaces',
  'comidas-dia': 'Meals of the day',
  'servicios-ciudad': 'City services',
  'transporte-urbano': 'Urban transport',
  'tecnologia-aula': 'Classroom technology',
  'laboratorio-ciencias': 'Science lab',
  'matematicas-clave': 'Key math concepts',
  'arte-musica': 'Art and music',
  'educacion-fisica': 'Physical education',
  'idiomas-cultura': 'Languages and culture',
  'deportes-populares': 'Popular sports',
  'ocio-digital': 'Digital leisure',
  'actividades-extra': 'After-school activities',
  'emociones-avanzadas': 'Advanced emotions',
  'fiestas-culturales': 'Cultural celebrations',
  'descubrir-ciudad': 'Discovering the city',
  'profesiones-suenos': 'Dream careers',
  'universidad': 'University life',
  'medioambiente': 'Environment',
  'innovacion-tecnologica': 'Technological innovation',
  'viajes-mundo': 'World travel',
  'ciudadania-activa': 'Active citizenship',
  'presentarte': 'Introducing yourself',
  'orientarte': 'Finding your way around school',
  'clase-sencilla': 'Simple phrases in class',
  'pedir-ayuda': 'Asking for help',
  'tienda-basica': 'Basic shopping',
  'familia-bienestar': 'Family and wellbeing',
  'participar-clase': 'Taking part in class',
  'trabajo-equipo': 'Working in teams',
  'explicar-problemas': 'Explaining problems',
  'resolver-conflictos': 'Resolving conflicts',
  'organizar-agenda': 'Planning the schedule',
  'pedir-recursos': 'Requesting resources',
  'rutinas-hogar-frases': 'Home routines',
  'salud-familiar': 'Family health',
  'tareas-compartidas': 'Shared chores',
  'planes-familiares': 'Family plans',
  'comida-familia': 'Family meals',
  'organizar-estudios': 'Organizing study time',
  'quedar-amigos-frases': 'Meeting with friends',
  'planear-eventos': 'Planning events',
  'expresar-opiniones': 'Expressing opinions',
  'invitar': 'Inviting someone',
  'redes-sociales': 'Social media',
  'deportes-ocio-frases': 'Sports and leisure',
  'administracion-ciudad': 'City paperwork',
  'viajes-ciudad': 'Travel and transport',
  'metas-personales': 'Personal goals',
  'voluntariado': 'Volunteering',
  'estudios-superiores': 'Further studies',
  'primer-trabajo': 'First job'
};

const enriched = grupos.map((grupo) => {
  const groupCopy = groupTranslations[grupo.id];
  if (!groupCopy) {
    throw new Error(`Falta traducción para el grupo ${grupo.id}`);
  }

  return {
    id: grupo.id,
    tipo: grupo.tipo,
    nombre: {
      es: grupo.nombre,
      en: groupCopy.name
    },
    descripcion: {
      es: grupo.descripcion,
      en: groupCopy.description
    },
    nivel: {
      orden: grupo.nivel.orden,
      titulo: {
        es: grupo.nivel.titulo,
        en: groupCopy.levelTitle
      },
      descripcion: {
        es: grupo.nivel.descripcion,
        en: groupCopy.levelDescription
      },
      clases: grupo.nivel.clases
    },
    temas: grupo.temas.map((tema) => {
      const temaCopy = topicTranslations[tema.id];
      if (!temaCopy) {
        throw new Error(`Falta traducción para el tema ${tema.id}`);
      }
      return {
        id: tema.id,
        nombre: {
          es: tema.nombre,
          en: temaCopy
        },
        palabras: tema.palabras
      };
    })
  };
});

const outputPath = path.join(__dirname, '..', 'src', 'data', 'grupos.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2));
console.log(`Archivo generado en ${outputPath}`);
