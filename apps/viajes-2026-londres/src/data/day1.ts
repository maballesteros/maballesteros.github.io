import type { DayPlan } from './types';
import { docsBase } from './shared';

export const day1: DayPlan = {
  id: 'day1',
  label: 'Día 1',
  subtitle: 'Aterrizaje + South Bank + London Eye',
  date: 'Viernes 24/07',
  theme: 'Aterrizaje elegante y primer wow visual',
  summary:
    'El primer día está diseñado para entrar en Londres sin desgaste: llegar, instalarse, hacer una compra mínima y vivir un paseo breve pero icónico antes del London Eye.',
  highlight:
    'La tarde no intenta hacer mucho; intenta que el viaje arranque con el Londres de postal y con energía guardada para el sábado.',
  fixed: [
    'Vuelo ida W9 5368',
    'Transfer privado desde LTN a las 12:20',
    'Check-in del apartamento desde las 14:00',
    'London Eye a las 20:00',
  ],
  stops: [
    {
      time: '10:00-11:35',
      title: 'Vuelo',
      area: 'VLC -> LTN',
      narrative:
        'El viaje arranca de verdad aquí: vuelo W9 5368, primer cambio de chip a modo Londres y la sensación de que toda la preparación previa ya se convierte en viaje real. Aunque este tramo no sea turístico, marca mucho el tono del día: si se gestiona con calma, la tarde se vuelve suave y muy disfrutable.',
      details: [
        'Buen momento para repasar con los peques el plan visual de la tarde: río, Big Ben, luces y London Eye.',
        'Llegar con esa película mental hace que el primer paseo se viva con más ilusión.',
      ],
      reservation: 'W9 5368 · salida 10:00 · llegada prevista 11:35',
      supportCards: [
        {
          title: 'Referencia de vuelo',
          summary: 'El dato operativo clave de esta primera franja.',
          bullets: [
            'Vuelo W9 5368, VLC -> LTN.',
            'Conviene llevar pasaportes y ETA muy a mano al aterrizar.',
            'Si el vuelo se retrasa, la prioridad operativa pasa inmediatamente al transfer.',
          ],
        },
      ],
      links: [
        { label: 'Reserva vuelos', href: `${docsBase}/reserva-vuelos.pdf` },
      ],
    },
    {
      time: '11:35-12:20',
      title: 'Llegada + control + equipaje',
      area: 'LTN',
      narrative:
        'Aquí toca el bloque práctico: pasaportes, cintas de equipaje y salida por llegadas con todo el grupo coordinado. La clave de esta franja no es avanzar rápido, sino proteger la energía del día 1 para que el paseo posterior se sienta ligero y no como una continuación del aeropuerto.',
      details: [
        'Si alguna fase se atasca, aviso rápido al transfer y fuera presión.',
        'Cuanto menos desgaste metáis aquí, más mágico se siente luego South Bank.',
      ],
      supportCards: [
        {
          title: 'Protocolo rápido LTN',
          summary: 'La secuencia mínima para no perder control en llegadas.',
          bullets: [
            'Pasaportes, equipaje y salida por llegadas sin dispersarse.',
            'Al recuperar datos/WiFi, revisar si hay mensaje del conductor.',
            'Si veis atasco claro en esta fase, avisar cuanto antes al transfer.',
          ],
        },
      ],
    },
    {
      time: '12:20',
      title: 'Recogida transfer privado en LTN',
      area: 'Llegadas LTN',
      narrative:
        'Punto de encuentro en llegadas con cartel del titular. Tenéis 60 minutos de espera incluida desde aterrizaje, así que el plan ya nace con colchón para retrasos normales. Es una de esas decisiones logísticas que mejoran mucho un viaje familiar.',
      details: [
        'Evita correr y os permite entrar a Londres por la puerta grande, sin fricción.',
        'Prioridad absoluta si hay incidencia: avisar al transfer.',
      ],
      reservation: 'Limowide · localizador 2107972',
      practical: 'Teléfono rápido transfer llegada: +44 7458 148595',
      supportCards: [
        {
          title: 'Incidencias transfer LTN',
          summary: 'Qué hacer si no aparece el conductor o el aeropuerto se atasca.',
          bullets: [
            'Buscar cartel del titular al salir por llegadas.',
            'Si no aparece en 5-10 min: escribir o llamar a +44 7458 148595.',
            'Escalada adicional 24/7: +91 98842 73784.',
            'Si no se resuelve: soporte eDreams +1 855 980 5669.',
            'Plan B inmediato: coach a Victoria + taxi al apartamento.',
          ],
        },
      ],
      links: [
        { label: 'Transfer llegada', href: `${docsBase}/transfer-ltn-apartamento.pdf` },
      ],
    },
    {
      time: '13:30-14:15',
      title: 'Llegada estimada a Kennington',
      area: 'Kennington',
      narrative:
        'Con tráfico variable, lo razonable es llegar cerca de la ventana de check-in. Mientras avanzáis hacia Kennington ya aparece la sensación de ciudad global, donde la arquitectura clásica convive con ritmo urbano. Este tramo, aunque no sea una visita, tiene valor estratégico porque os deja muy bien posicionados para moveros luego al corazón turístico.',
      details: ['Kennington funciona muy bien como base por equilibrio entre centralidad y descanso.'],
      supportCards: [
        {
          title: 'Base del viaje',
          summary: 'El piso ya os deja bien colocados para el resto de Londres.',
          bullets: [
            'Dirección base: 1A Kennington Lane, SE11 4RG.',
            'Check-in previsto desde las 14:00.',
            'Buena ubicación para moverse rápido al centro sin vivir en el ruido del centro.',
          ],
        },
      ],
      links: [
        { label: 'Reserva apartamento', href: `${docsBase}/reserva-apartamento.pdf` },
      ],
    },
    {
      time: '14:00-16:30',
      title: 'Check-in + descanso + compra mínima',
      area: 'Apartamento en Kennington',
      narrative:
        'Este bloque compra tranquilidad real para todo el viaje. Instalación ordenada, revisión básica del apartamento y compra mínima resuelta para no volver tarde con tareas pendientes. Tiene menos glamour que el resto, pero mucho valor práctico: cuanto mejor se haga aquí, más libres vais a estar después.',
      details: [
        'Compra mínima para la noche de llegada y el desayuno del día 2.',
        'Pequeño descanso para bajar del modo aeropuerto al modo viaje.',
      ],
      supportCards: [
        {
          title: 'Compra mínima útil',
          summary: 'Pequeñas cosas que compran mucha tranquilidad el resto del viaje.',
          bullets: [
            'Desayuno del día 2 resuelto antes de salir por la tarde.',
            'Cena ligera o recurso rápido para no depender del regreso nocturno.',
            'Agua, snacks y cualquier básico de peques antes del bloque del Eye.',
          ],
        },
      ],
      links: [
        { label: 'Reserva apartamento', href: `${docsBase}/reserva-apartamento.pdf` },
      ],
    },
    {
      time: '16:30-16:50',
      title: 'Salimos de Kennington hacia Waterloo',
      area: 'Kennington / Northern line / Waterloo',
      narrative:
        'Subís a la Northern line y en pocos minutos estáis en Waterloo. Al salir a superficie y buscar el río se produce ese pequeño click que tiene el primer día bien hecho: dejáis atrás el barrio y aparecéis de golpe en el gran escenario visual de Londres.',
      details: ['Waterloo es una entrada magnífica porque os deja a un paseo del Támesis y del eje Westminster / South Bank.'],
      supportCards: [
        {
          title: 'Movimiento inteligente',
          summary: 'Un tramo corto para transformar logística en Londres de postal.',
          bullets: [
            'El valor aquí no está en el transporte, sino en lo bien que os deja colocados para la tarde.',
            'Si vais cansados, esta ruta protege el día porque evita enlaces raros y decisiones de última hora.',
          ],
        },
      ],
    },
    {
      time: '16:50-17:20',
      title: 'Westminster Bridge + Big Ben (exterior)',
      area: 'Westminster',
      narrative:
        'Ahora sí: la primera gran postal del viaje. Acercarse al puente y encuadrar Parlamento y Big Ben casi de frente tiene el efecto exacto que buscáis para este arranque, una mezcla de reconocimiento inmediato y emoción de llegada.',
      details: [
        'Big Ben es el nombre de la campana; la torre es la Elizabeth Tower.',
        'La silueta conjunta de Parlamento y torre es una de las imágenes políticas más famosas del mundo.',
      ],
      supportCards: [
        {
          title: 'Tip de guía',
          summary: 'Parada corta, pero de recompensa visual altísima.',
          bullets: [
            'Es la primera gran foto reconocible del viaje.',
            'Contar allí que Big Ben es la campana y no la torre siempre tiene efecto.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Westminster_Bridge_and_Big_Ben_in_London.jpg/1280px-Westminster_Bridge_and_Big_Ben_in_London.jpg',
      imageAlt: 'Westminster Bridge y Big Ben',
    },
    {
      time: '17:20-17:45',
      title: 'Paseo por South Bank',
      area: 'South Bank / County Hall / Jubilee Gardens',
      narrative:
        'Al cruzar a South Bank, Londres cambia de tono: menos institución, más paseo, más vida. Artistas callejeros, terrazas, gente caminando junto al río y esa mezcla tan londinense entre monumento y vida cotidiana que hace que incluso un tramo corto se sienta especial.',
      details: [
        'South Bank pasó de frente industrial a uno de los paseos culturales más queridos de la ciudad.',
        'Este tramo funciona muy bien el primer día porque mezcla río, ambiente y vistas sin exigir mucho físicamente.',
      ],
      supportCards: [
        {
          title: 'Qué mirar aquí',
          summary: 'No es solo caminar: es empezar a leer Londres con buen pie.',
          bullets: [
            'Ambiente de ribera, artistas, terrazas y el frente monumental al otro lado del río.',
            'Muy buen tramo para entrar en el viaje sin cansaros demasiado.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/London_Eye_Sunset.jpg/1280px-London_Eye_Sunset.jpg',
      imageAlt: 'South Bank y London Eye al atardecer',
    },
    {
      time: '17:45-18:10',
      title: 'Parada corta para recargar',
      area: 'South Bank',
      narrative:
        'La pausa estratégica del primer día. Bebida, snack y baño sin alejaros de la zona del Eye. Parece un detalle menor, pero es exactamente el tipo de pausa que evita que la tarde se haga larga y os deja llegar al bloque nocturno con el grupo entero en buena energía.',
      details: ['En viajes familiares, este tipo de pausa marca mucha diferencia en cómo se vive la noche.'],
      supportCards: [
        {
          title: 'Pausa con intención',
          summary: 'Esta media hora compra energía para el bloque fuerte de la noche.',
          bullets: [
            'Bebida, baño y snack sin alejaros del Eye.',
            'Es mejor esta pausa que llegar al London Eye con el grupo ya cansado.',
          ],
        },
      ],
    },
    {
      time: '18:10-18:30',
      title: 'Cierre del paseo y reconocimiento del acceso al Eye',
      area: 'South Bank',
      narrative:
        'Últimas fotos de ribera, revisión tranquila de tickets y reconocimiento visual de por dónde entrar luego. Es un bloque pequeño, pero muy inteligente: os deja colocados para volver al Eye sin improvisaciones.',
      details: [
        'El primer día no se gana haciendo más cosas, sino quitándole fricción al momento fuerte.',
        'Ver con calma el acceso os permite volver a las 19:15-19:30 sin incertidumbre.',
      ],
      supportCards: [
        {
          title: 'Acceso al Eye',
          summary: 'Llegar con el acceso ubicado hace toda la noche mucho más fácil.',
          bullets: [
            'Conviene revisar tickets y detectar claramente por dónde entrar.',
            'A estas horas la misión ya no es ver más, sino dejar el bloque del Eye limpísimo.',
          ],
        },
      ],
      links: [
        { label: 'Tickets London Eye', href: `${docsBase}/tickets-london-eye.pdf` },
      ],
    },
    {
      time: '19:15-19:30',
      title: 'Llegada al London Eye',
      area: 'Ribera del Támesis',
      narrative:
        'Llegar con margen aquí cambia totalmente la experiencia. No es lo mismo correr hacia una cola que entrar ya con el río, Westminster y la luz de la tarde colocados a vuestro favor.',
      details: [
        'La hora del ticket corresponde a la entrada a cola, no al embarque inmediato.',
        'Estos minutos de margen convierten una logística tensa en una espera disfrutona.',
      ],
      supportCards: [
        {
          title: 'Mini tip operativo',
          summary: 'El margen aquí no es lujo; es calidad de experiencia.',
          bullets: [
            'La hora del ticket es acceso a cola, no subida directa.',
            'Llegar así evita tensión y deja disfrutar el entorno antes de entrar.',
          ],
        },
      ],
      links: [
        { label: 'Tickets London Eye', href: `${docsBase}/tickets-london-eye.pdf` },
      ],
    },
    {
      time: '20:00',
      title: 'London Eye (fijo)',
      area: 'Ribera del Támesis',
      narrative:
        'El primer gran wow del viaje. La rueda panorámica no solo impresiona: os da mapa mental real de la ciudad. Westminster, la curva del río y el skyline moderno quedan ordenados en la cabeza desde el primer día.',
      reservation: 'Entrada reservada para las 20:00',
      details: [
        'La hora del ticket corresponde a la cola, no al embarque directo.',
        'Se inauguró en 2000 como atracción del milenio y terminó quedándose como icono estable de la ciudad.',
        'La lectura panorámica ayuda mucho a entender el resto del viaje.',
      ],
      supportCards: [
        {
          title: 'Ticket y lectura de la ciudad',
          summary: 'No es solo una atracción: os ordena mentalmente Londres para el resto del viaje.',
          bullets: [
            'Reserva cerrada para las 20:00.',
            'Desde arriba ganáis mapa mental real de Westminster, el río y parte del skyline.',
            'Muy buena primera gran experiencia porque mezcla emoción y orientación.',
          ],
        },
      ],
      links: [
        { label: 'Tickets London Eye', href: `${docsBase}/tickets-london-eye.pdf` },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/London-Eye-2009.JPG/1280px-London-Eye-2009.JPG',
      imageAlt: 'London Eye al atardecer',
    },
    {
      time: '21:00-22:00',
      title: 'Cena y regreso',
      area: 'South Bank o Kennington',
      narrative:
        'El cierre ideal del primer día no es un sprint final, sino una cena tranquila y la sensación de haber inaugurado el viaje con los grandes iconos ya vividos. Si aún hay batería, las luces del río rematan muy bien la noche; si no, volver pronto es una decisión inteligente, no una renuncia.',
      details: ['Objetivo emocional del día: acostarse con el viaje ya inaugurado y energía guardada para el sábado.'],
      supportCards: [
        {
          title: 'Criterio para cerrar bien',
          summary: 'El mejor final del Día 1 es el que protege el sábado.',
          bullets: [
            'Si aún hay ganas, paseo corto con luces en el río.',
            'Si no, volver pronto es una buena decisión, no una derrota.',
          ],
        },
      ],
    },
  ],
};
