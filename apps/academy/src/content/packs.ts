import type { L, Pack } from "./types";

/**
 * PACKS — edita aquí preus, hores i textos sense tocar cap component.
 *
 * Regles (es comproven automàticament a validate.ts; el build falla si no es compleixen):
 *  - Cap de setmana: màxim 20 h en total i 10 h per dia.
 *  - Stage 4 dies: màxim 30 h en total.
 *  - La suma d'hores del programa dia a dia ha de coincidir amb `hours`.
 *
 * ⚠️ Dades PROVISIONALS. priceFrom: null → es mostra "XXX €".
 */

const MEALS_WEEKEND: L = {
  ca: "Pensió completa: dinar i sopar de dissabte, esmorzar i dinar de diumenge",
  es: "Pensión completa: comida y cena del sábado, desayuno y comida del domingo",
  en: "Full board: Saturday lunch and dinner, Sunday breakfast and lunch",
};

const MEALS_STAGE: L = {
  ca: "Pensió completa: de dinar de divendres a dinar de dilluns",
  es: "Pensión completa: de la comida del viernes a la comida del lunes",
  en: "Full board: from Friday lunch to Monday lunch",
};

const INCLUDES_BASE: L[] = [
  {
    ca: "Entrenament amb entrenadors titulats PS",
    es: "Entrenamiento con entrenadores titulados PS",
    en: "Training with certified PS coaches",
  },
  {
    ca: "Pistes, pilotes i material d'entrenament",
    es: "Pistas, pelotas y material de entrenamiento",
    en: "Courts, balls and training equipment",
  },
  {
    ca: "Diagnòstic inicial de nivell",
    es: "Diagnóstico inicial de nivel",
    en: "Initial level assessment",
  },
  {
    ca: "Informe final amb pla de millora",
    es: "Informe final con plan de mejora",
    en: "Final report with improvement plan",
  },
  {
    ca: "Pack de benvinguda PS",
    es: "Pack de bienvenida PS",
    en: "PS welcome pack",
  },
  {
    ca: "Assegurança d'activitat",
    es: "Seguro de actividad",
    en: "Activity insurance",
  },
];

const EXCLUDES_BASE: L[] = [
  {
    ca: "Desplaçament fins a l'acadèmia",
    es: "Desplazamiento hasta la academia",
    en: "Travel to the academy",
  },
  {
    ca: "Begudes alcohòliques i extres del bar",
    es: "Bebidas alcohólicas y extras del bar",
    en: "Alcoholic drinks and bar extras",
  },
  {
    ca: "Extres opcionals (fisio, habitació individual…)",
    es: "Extras opcionales (fisio, habitación individual…)",
    en: "Optional extras (physio, single room…)",
  },
];

export const packs: Pack[] = [
  // ───────────────────────── CAP DE SETMANA ─────────────────────────
  {
    slug: "clinic-essential",
    format: "cap-de-setmana",
    name: "Clinic Essential",
    tagline: {
      ca: "La base sòlida per començar a jugar amb criteri.",
      es: "La base sólida para empezar a jugar con criterio.",
      en: "Solid foundations to start playing with intent.",
    },
    description: {
      ca: "Un cap de setmana per posar ordre al teu joc: empunyadura, posició a pista, cops de fons i primeres sortides de vidre. Ritme assequible, molta repetició i temps per gaudir de l'acadèmia.",
      es: "Un fin de semana para poner orden en tu juego: empuñadura, posición en pista, golpes de fondo y primeras salidas de pared. Ritmo asequible, mucha repetición y tiempo para disfrutar de la academia.",
      en: "A weekend to sort out your game: grip, court positioning, baseline shots and your first exits off the glass. Manageable pace, lots of reps and time to enjoy the academy.",
    },
    hours: 8,
    nights: 1,
    meals: MEALS_WEEKEND,
    levels: ["iniciacio", "intermedi"],
    groupSize: 4,
    priceFrom: null,
    program: [
      {
        day: "ds",
        title: {
          ca: "Fonaments i diagnòstic",
          es: "Fundamentos y diagnóstico",
          en: "Fundamentals and assessment",
        },
        hours: 5,
        items: [
          {
            ca: "Benvinguda i diagnòstic de nivell en pista",
            es: "Bienvenida y diagnóstico de nivel en pista",
            en: "Welcome and on-court level assessment",
          },
          {
            ca: "Tècnica de dreta, revés i volea",
            es: "Técnica de derecha, revés y volea",
            en: "Forehand, backhand and volley technique",
          },
          {
            ca: "Posicionament a pista i comunicació amb la parella",
            es: "Posicionamiento en pista y comunicación con la pareja",
            en: "Court positioning and partner communication",
          },
        ],
      },
      {
        day: "dg",
        title: {
          ca: "Vidre i joc real",
          es: "Pared y juego real",
          en: "Glass and live play",
        },
        hours: 3,
        items: [
          {
            ca: "Sortides de vidre lateral i de fons",
            es: "Salidas de pared lateral y de fondo",
            en: "Side and back-glass exits",
          },
          {
            ca: "Partit dirigit amb correccions",
            es: "Partido dirigido con correcciones",
            en: "Coached match with corrections",
          },
          {
            ca: "Informe final i pla per a casa",
            es: "Informe final y plan para casa",
            en: "Final report and take-home plan",
          },
        ],
      },
    ],
    includes: INCLUDES_BASE,
    excludes: EXCLUDES_BASE,
    extras: ["individual", "acompanyant", "aeroport"],
    image: "packEssential",
  },
  {
    slug: "clinic-focus",
    format: "cap-de-setmana",
    name: "Clinic Focus",
    featured: true,
    tagline: {
      ca: "Un cop, un objectiu, 14 hores per dominar-lo.",
      es: "Un golpe, un objetivo, 14 horas para dominarlo.",
      en: "One shot, one goal, 14 hours to master it.",
    },
    description: {
      ca: "Clínic temàtic: cada cap de setmana treballem a fons un aspecte concret del joc (globus, víbora, bandeja, defensa, remat per 3…). Vídeo-anàlisi del cop abans i després perquè vegis el progrés.",
      es: "Clinic temático: cada fin de semana trabajamos a fondo un aspecto concreto del juego (globo, víbora, bandeja, defensa, remate por 3…). Vídeo-análisis del golpe antes y después para que veas el progreso.",
      en: "Themed clinic: each weekend we go deep on one part of the game (lob, víbora, bandeja, defence, x3 smash…). Before-and-after video analysis so you can see the progress.",
    },
    hours: 14,
    nights: 1,
    meals: MEALS_WEEKEND,
    levels: ["intermedi", "avancat"],
    groupSize: 4,
    priceFrom: null,
    program: [
      {
        day: "ds",
        title: {
          ca: "Desmuntar i reconstruir el cop",
          es: "Desmontar y reconstruir el golpe",
          en: "Break down and rebuild the shot",
        },
        hours: 8,
        items: [
          {
            ca: "Gravació inicial del cop temàtic",
            es: "Grabación inicial del golpe temático",
            en: "Initial filming of the themed shot",
          },
          {
            ca: "Bloc tècnic: preparació, impacte i acabament",
            es: "Bloque técnico: preparación, impacto y acabado",
            en: "Technical block: preparation, contact and finish",
          },
          {
            ca: "Exercicis de repetició amb carro i situacions de joc",
            es: "Ejercicios de repetición con carro y situaciones de juego",
            en: "Basket drills and game situations",
          },
          {
            ca: "Preparació física específica i estiraments",
            es: "Preparación física específica y estiramientos",
            en: "Shot-specific conditioning and stretching",
          },
        ],
      },
      {
        day: "dg",
        title: {
          ca: "Del drill al partit",
          es: "Del ejercicio al partido",
          en: "From drill to match",
        },
        hours: 6,
        items: [
          {
            ca: "Repàs de vídeo i correccions individuals",
            es: "Repaso de vídeo y correcciones individuales",
            en: "Video review and individual corrections",
          },
          {
            ca: "Tàctica: quan i on fer servir el cop",
            es: "Táctica: cuándo y dónde usar el golpe",
            en: "Tactics: when and where to use the shot",
          },
          {
            ca: "Partits amb punts condicionats",
            es: "Partidos con puntos condicionados",
            en: "Conditioned-point matches",
          },
          {
            ca: "Gravació final i informe comparatiu",
            es: "Grabación final e informe comparativo",
            en: "Final filming and comparison report",
          },
        ],
      },
    ],
    includes: [
      ...INCLUDES_BASE,
      {
        ca: "Vídeo-anàlisi del cop temàtic (abans i després)",
        es: "Vídeo-análisis del golpe temático (antes y después)",
        en: "Before/after video analysis of the themed shot",
      },
    ],
    excludes: EXCLUDES_BASE,
    extras: ["individual", "acompanyant", "fisio", "aeroport"],
    image: "packFocus",
  },
  {
    slug: "clinic-max",
    format: "cap-de-setmana",
    name: "Clinic Max",
    tagline: {
      ca: "20 hores. El màxim que cap en un cap de setmana.",
      es: "20 horas. El máximo que cabe en un fin de semana.",
      en: "20 hours. The most a weekend can hold.",
    },
    description: {
      ca: "Per a jugadors exigents que volen esprémer cada minut: 10 hores de pàdel cada dia entre tècnica, tàctica, físic i partits d'alta intensitat. Grups de nivell homogeni i fisioteràpia inclosa.",
      es: "Para jugadores exigentes que quieren exprimir cada minuto: 10 horas de pádel cada día entre técnica, táctica, físico y partidos de alta intensidad. Grupos de nivel homogéneo y fisioterapia incluida.",
      en: "For demanding players who want every minute: 10 hours of padel a day across technique, tactics, fitness and high-intensity matches. Level-matched groups and physio included.",
    },
    hours: 20,
    nights: 1,
    meals: MEALS_WEEKEND,
    levels: ["avancat", "competicio"],
    groupSize: 4,
    priceFrom: null,
    program: [
      {
        day: "ds",
        title: {
          ca: "Volum i intensitat",
          es: "Volumen e intensidad",
          en: "Volume and intensity",
        },
        hours: 10,
        items: [
          {
            ca: "Activació i diagnòstic d'alt rendiment",
            es: "Activación y diagnóstico de alto rendimiento",
            en: "Activation and performance assessment",
          },
          {
            ca: "Bloc tècnic: joc aeri i definició",
            es: "Bloque técnico: juego aéreo y definición",
            en: "Technical block: overheads and finishing",
          },
          {
            ca: "Bloc tàctic: transicions i presa de xarxa",
            es: "Bloque táctico: transiciones y toma de red",
            en: "Tactical block: transitions and taking the net",
          },
          {
            ca: "Partits a alta intensitat i sessió de fisio",
            es: "Partidos a alta intensidad y sesión de fisio",
            en: "High-intensity matches and physio session",
          },
        ],
      },
      {
        day: "dg",
        title: {
          ca: "Competir amb cap",
          es: "Competir con cabeza",
          en: "Compete smart",
        },
        hours: 10,
        items: [
          {
            ca: "Defensa avançada i contraatac",
            es: "Defensa avanzada y contraataque",
            en: "Advanced defence and counter-attack",
          },
          {
            ca: "Estratègia de partit i lectura del rival",
            es: "Estrategia de partido y lectura del rival",
            en: "Match strategy and reading opponents",
          },
          {
            ca: "Mini-torneig intern amb arbitratge",
            es: "Mini-torneo interno con arbitraje",
            en: "Refereed in-house mini tournament",
          },
          {
            ca: "Informe final individual",
            es: "Informe final individual",
            en: "Individual final report",
          },
        ],
      },
    ],
    includes: [
      ...INCLUDES_BASE,
      {
        ca: "Sessió de fisioteràpia de recuperació",
        es: "Sesión de fisioterapia de recuperación",
        en: "Recovery physio session",
      },
      {
        ca: "Vídeo-anàlisi de partit",
        es: "Vídeo-análisis de partido",
        en: "Match video analysis",
      },
    ],
    excludes: EXCLUDES_BASE,
    extras: ["individual", "acompanyant", "fisio", "aeroport"],
    image: "packMax",
  },

  // ───────────────────────── STAGE 4 DIES ─────────────────────────
  {
    slug: "stage-base",
    format: "stage-4-dies",
    name: "Stage Base",
    tagline: {
      ca: "Millora global amb temps per descansar i gaudir.",
      es: "Mejora global con tiempo para descansar y disfrutar.",
      en: "All-round improvement with time to rest and enjoy.",
    },
    description: {
      ca: "Quatre dies equilibrats: 16 hores de pàdel repartides perquè el cos assimili i en surtis millor jugador, no esgotat. Ideal si vens amb parella o amics i vols combinar entrenament i escapada.",
      es: "Cuatro días equilibrados: 16 horas de pádel repartidas para que el cuerpo asimile y salgas mejor jugador, no agotado. Ideal si vienes en pareja o con amigos y quieres combinar entrenamiento y escapada.",
      en: "Four balanced days: 16 hours of padel spread out so your body absorbs it and you leave a better player, not a wreck. Ideal if you're coming with a partner or friends for a training getaway.",
    },
    hours: 16,
    nights: 3,
    meals: MEALS_STAGE,
    levels: ["iniciacio", "intermedi", "avancat"],
    groupSize: 4,
    priceFrom: null,
    program: [
      {
        day: "dv",
        title: {
          ca: "Arribada i diagnòstic",
          es: "Llegada y diagnóstico",
          en: "Arrival and assessment",
        },
        hours: 3,
        items: [
          {
            ca: "Check-in i benvinguda",
            es: "Check-in y bienvenida",
            en: "Check-in and welcome",
          },
          {
            ca: "Diagnòstic de nivell i objectius",
            es: "Diagnóstico de nivel y objetivos",
            en: "Level assessment and goal setting",
          },
        ],
      },
      {
        day: "ds",
        title: {
          ca: "Tècnica de base",
          es: "Técnica de base",
          en: "Core technique",
        },
        hours: 5,
        items: [
          {
            ca: "Cops de fons i volea",
            es: "Golpes de fondo y volea",
            en: "Groundstrokes and volleys",
          },
          {
            ca: "Sortides de vidre",
            es: "Salidas de pared",
            en: "Glass exits",
          },
        ],
      },
      {
        day: "dg",
        title: {
          ca: "Joc aeri i tàctica",
          es: "Juego aéreo y táctica",
          en: "Overheads and tactics",
        },
        hours: 5,
        items: [
          {
            ca: "Globus, bandeja i remat",
            es: "Globo, bandeja y remate",
            en: "Lob, bandeja and smash",
          },
          {
            ca: "Partits dirigits",
            es: "Partidos dirigidos",
            en: "Coached matches",
          },
        ],
      },
      {
        day: "dl",
        title: {
          ca: "Partit i informe",
          es: "Partido e informe",
          en: "Match and report",
        },
        hours: 3,
        items: [
          {
            ca: "Partit final amb correccions",
            es: "Partido final con correcciones",
            en: "Final match with corrections",
          },
          {
            ca: "Informe i pla de continuïtat",
            es: "Informe y plan de continuidad",
            en: "Report and follow-up plan",
          },
        ],
      },
    ],
    includes: INCLUDES_BASE,
    excludes: EXCLUDES_BASE,
    extras: [
      "individual",
      "acompanyant",
      "fisio",
      "video",
      "privada",
      "aeroport",
    ],
    image: "packBase",
  },
  {
    slug: "stage-performance",
    format: "stage-4-dies",
    name: "Stage Performance",
    featured: true,
    tagline: {
      ca: "Per a qui compiteix i vol guanyar més partits.",
      es: "Para quien compite y quiere ganar más partidos.",
      en: "For competitors who want to win more matches.",
    },
    description: {
      ca: "24 hores pensades per al jugador de competició amateur: patrons de joc, gestió de punts clau, físic específic i vídeo-anàlisi diària. Sortiràs amb un pla de temporada personalitzat.",
      es: "24 horas pensadas para el jugador de competición amateur: patrones de juego, gestión de puntos clave, físico específico y vídeo-análisis diario. Saldrás con un plan de temporada personalizado.",
      en: "24 hours built for amateur competitors: game patterns, managing big points, padel-specific fitness and daily video analysis. You'll leave with a personalised season plan.",
    },
    hours: 24,
    nights: 3,
    meals: MEALS_STAGE,
    levels: ["intermedi", "avancat", "competicio"],
    groupSize: 4,
    priceFrom: null,
    program: [
      {
        day: "dv",
        title: {
          ca: "Diagnòstic de competició",
          es: "Diagnóstico de competición",
          en: "Competition assessment",
        },
        hours: 4,
        items: [
          {
            ca: "Test físic i tècnic",
            es: "Test físico y técnico",
            en: "Fitness and technical testing",
          },
          {
            ca: "Partit gravat per a l'anàlisi",
            es: "Partido grabado para el análisis",
            en: "Filmed match for analysis",
          },
        ],
      },
      {
        day: "ds",
        title: {
          ca: "Patrons d'atac",
          es: "Patrones de ataque",
          en: "Attacking patterns",
        },
        hours: 7,
        items: [
          {
            ca: "Vídeo-anàlisi del partit de divendres",
            es: "Vídeo-análisis del partido del viernes",
            en: "Video review of Friday's match",
          },
          {
            ca: "Joc aeri, definició i presa de xarxa",
            es: "Juego aéreo, definición y toma de red",
            en: "Overheads, finishing and taking the net",
          },
          {
            ca: "Físic específic de pàdel",
            es: "Físico específico de pádel",
            en: "Padel-specific conditioning",
          },
        ],
      },
      {
        day: "dg",
        title: {
          ca: "Defensa i punts clau",
          es: "Defensa y puntos clave",
          en: "Defence and big points",
        },
        hours: 7,
        items: [
          {
            ca: "Defensa avançada i transicions",
            es: "Defensa avanzada y transiciones",
            en: "Advanced defence and transitions",
          },
          {
            ca: "Gestió de punts clau i mentalitat",
            es: "Gestión de puntos clave y mentalidad",
            en: "Managing big points and mindset",
          },
          {
            ca: "Partits amb situacions de marcador",
            es: "Partidos con situaciones de marcador",
            en: "Scoreline-scenario matches",
          },
        ],
      },
      {
        day: "dl",
        title: {
          ca: "Competició i pla de temporada",
          es: "Competición y plan de temporada",
          en: "Competition and season plan",
        },
        hours: 6,
        items: [
          {
            ca: "Torneig intern",
            es: "Torneo interno",
            en: "In-house tournament",
          },
          {
            ca: "Informe final i pla de temporada",
            es: "Informe final y plan de temporada",
            en: "Final report and season plan",
          },
        ],
      },
    ],
    includes: [
      ...INCLUDES_BASE,
      {
        ca: "Vídeo-anàlisi diària",
        es: "Vídeo-análisis diario",
        en: "Daily video analysis",
      },
      {
        ca: "Pla de temporada personalitzat",
        es: "Plan de temporada personalizado",
        en: "Personalised season plan",
      },
    ],
    excludes: EXCLUDES_BASE,
    extras: ["individual", "acompanyant", "fisio", "privada", "aeroport"],
    image: "packPerformance",
  },
  {
    slug: "stage-elite",
    format: "stage-4-dies",
    name: "Stage Elite",
    tagline: {
      ca: "30 hores. Màxima intensitat, zero excuses.",
      es: "30 horas. Máxima intensidad, cero excusas.",
      en: "30 hours. Maximum intensity, zero excuses.",
    },
    description: {
      ca: "L'experiència més exigent de PS: el màxim d'hores permès, grups reduïts de nivell alt, fisioteràpia diària i seguiment individual per part del cap tècnic. Per a jugadors que ho volen tot.",
      es: "La experiencia más exigente de PS: el máximo de horas permitido, grupos reducidos de nivel alto, fisioterapia diaria y seguimiento individual por parte del jefe técnico. Para jugadores que lo quieren todo.",
      en: "PS's most demanding experience: the maximum hours allowed, small high-level groups, daily physio and one-to-one follow-up from the head coach. For players who want it all.",
    },
    hours: 30,
    nights: 3,
    meals: MEALS_STAGE,
    levels: ["avancat", "competicio"],
    groupSize: 4,
    priceFrom: null,
    program: [
      {
        day: "dv",
        title: {
          ca: "Diagnòstic d'alt rendiment",
          es: "Diagnóstico de alto rendimiento",
          en: "High-performance assessment",
        },
        hours: 6,
        items: [
          {
            ca: "Test físic, tècnic i tàctic complet",
            es: "Test físico, técnico y táctico completo",
            en: "Full fitness, technical and tactical testing",
          },
          {
            ca: "Primer bloc d'entrenament i partit gravat",
            es: "Primer bloque de entrenamiento y partido grabado",
            en: "First training block and filmed match",
          },
        ],
      },
      {
        day: "ds",
        title: { ca: "Atac total", es: "Ataque total", en: "All-out attack" },
        hours: 9,
        items: [
          {
            ca: "Joc aeri avançat: víbora, remat per 3 i per 4",
            es: "Juego aéreo avanzado: víbora, remate por 3 y por 4",
            en: "Advanced overheads: víbora, x3 and x4 smash",
          },
          {
            ca: "Patrons d'atac amb la parella",
            es: "Patrones de ataque con la pareja",
            en: "Attacking patterns with your partner",
          },
          {
            ca: "Físic d'alta intensitat i fisio",
            es: "Físico de alta intensidad y fisio",
            en: "High-intensity conditioning and physio",
          },
        ],
      },
      {
        day: "dg",
        title: {
          ca: "Defensa i control",
          es: "Defensa y control",
          en: "Defence and control",
        },
        hours: 9,
        items: [
          {
            ca: "Defensa de doble vidre i contraatac",
            es: "Defensa de doble pared y contraataque",
            en: "Double-glass defence and counter-attack",
          },
          {
            ca: "Lectura de joc i estratègia avançada",
            es: "Lectura de juego y estrategia avanzada",
            en: "Game reading and advanced strategy",
          },
          {
            ca: "Partits contra entrenadors",
            es: "Partidos contra entrenadores",
            en: "Matches against the coaches",
          },
        ],
      },
      {
        day: "dl",
        title: { ca: "Test final", es: "Test final", en: "Final test" },
        hours: 6,
        items: [
          {
            ca: "Torneig final amb arbitratge",
            es: "Torneo final con arbitraje",
            en: "Refereed final tournament",
          },
          {
            ca: "Reunió individual amb el cap tècnic",
            es: "Reunión individual con el jefe técnico",
            en: "One-to-one with the head coach",
          },
        ],
      },
    ],
    includes: [
      ...INCLUDES_BASE,
      {
        ca: "Fisioteràpia diària",
        es: "Fisioterapia diaria",
        en: "Daily physio",
      },
      {
        ca: "Vídeo-anàlisi individual completa",
        es: "Vídeo-análisis individual completo",
        en: "Full individual video analysis",
      },
      {
        ca: "Seguiment online 4 setmanes després",
        es: "Seguimiento online 4 semanas después",
        en: "4 weeks of online follow-up",
      },
    ],
    excludes: EXCLUDES_BASE,
    extras: ["individual", "acompanyant", "aeroport"],
    image: "packElite",
  },
];

export function getPack(format: string, slug: string): Pack | undefined {
  return packs.find((p) => p.format === format && p.slug === slug);
}

export function packsByFormat(format: string): Pack[] {
  return packs.filter((p) => p.format === format);
}
