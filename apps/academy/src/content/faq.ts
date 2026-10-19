import type { FormatSlug, L } from "./types";

/** PREGUNTES FREQÜENTS — agrupades per categoria. `home: true` = surt a la home. */
export type FaqCategory =
  | "reserva"
  | "entrenament"
  | "allotjament"
  | "pagament"
  | "viatge";

export interface Faq {
  category: FaqCategory;
  q: L;
  a: L;
  home?: boolean;
  /** Si s'indica, també surt a la pàgina d'aquest format */
  formats?: FormatSlug[];
}

export const faqCategories: Record<FaqCategory, L> = {
  reserva: { ca: "Reserva", es: "Reserva", en: "Booking" },
  entrenament: { ca: "Entrenament", es: "Entrenamiento", en: "Training" },
  allotjament: {
    ca: "Allotjament i àpats",
    es: "Alojamiento y comidas",
    en: "Accommodation & meals",
  },
  pagament: {
    ca: "Pagament i cancel·lació",
    es: "Pago y cancelación",
    en: "Payment & cancellation",
  },
  viatge: { ca: "Com arribar", es: "Cómo llegar", en: "Getting here" },
};

export const faqs: Faq[] = [
  {
    category: "reserva",
    home: true,
    q: {
      ca: "Com reservo una plaça?",
      es: "¿Cómo reservo una plaza?",
      en: "How do I book a place?",
    },
    a: {
      ca: "Envia'ns una sol·licitud des del configurador o per WhatsApp. Et responem personalment en menys de 24 h per confirmar disponibilitat, resoldre dubtes i explicar-te com fer la paga i senyal.",
      es: "Envíanos una solicitud desde el configurador o por WhatsApp. Te respondemos personalmente en menos de 24 h para confirmar disponibilidad, resolver dudas y explicarte cómo hacer la paga y señal.",
      en: "Send us a request through the booking builder or on WhatsApp. We reply personally within 24 h to confirm availability, answer questions and explain how to pay the deposit.",
    },
  },
  {
    category: "reserva",
    q: {
      ca: "Puc venir sol o sola?",
      es: "¿Puedo venir solo o sola?",
      en: "Can I come on my own?",
    },
    a: {
      ca: "I tant. Fem grups per nivell, així que tindràs companys de joc del teu nivell des del primer minut.",
      es: "Por supuesto. Hacemos grupos por nivel, así que tendrás compañeros de juego de tu nivel desde el primer minuto.",
      en: "Absolutely. We group players by level, so you'll have playing partners at your level from minute one.",
    },
  },
  {
    category: "reserva",
    q: {
      ca: "Feu experiències per a grups o empreses?",
      es: "¿Hacéis experiencias para grupos o empresas?",
      en: "Do you run experiences for groups or companies?",
    },
    a: {
      ca: "Sí. Si sou 4 o més, podem adaptar dates, hores i programa. Escriu-nos i ho preparem a mida.",
      es: "Sí. Si sois 4 o más, podemos adaptar fechas, horas y programa. Escríbenos y lo preparamos a medida.",
      en: "Yes. If you're a group of 4 or more we can tailor dates, hours and programme. Get in touch and we'll build it for you.",
    },
  },
  {
    category: "entrenament",
    home: true,
    q: {
      ca: "Quin nivell necessito?",
      es: "¿Qué nivel necesito?",
      en: "What level do I need?",
    },
    a: {
      ca: "Tenim packs per a tots els nivells, d'iniciació a competició. A la sol·licitud ens indiques el teu nivell i el primer dia fem un diagnòstic per ajustar el grup.",
      es: "Tenemos packs para todos los niveles, de iniciación a competición. En la solicitud nos indicas tu nivel y el primer día hacemos un diagnóstico para ajustar el grupo.",
      en: "We have packs for every level, from beginner to competitive. Tell us your level in the request and on day one we assess you to fine-tune your group.",
    },
  },
  {
    category: "entrenament",
    home: true,
    formats: ["cap-de-setmana", "stage-4-dies"],
    q: {
      ca: "Quantes hores de pàdel puc fer com a màxim?",
      es: "¿Cuántas horas de pádel puedo hacer como máximo?",
      en: "What's the maximum number of padel hours?",
    },
    a: {
      ca: "Fins a 20 hores en un cap de setmana (10 h per dia) i fins a 30 hores en un stage de 4 dies. Més enllà d'això el rendiment baixa i el risc de lesió puja, per això no ho superem mai.",
      es: "Hasta 20 horas en un fin de semana (10 h por día) y hasta 30 horas en un stage de 4 días. Más allá de eso el rendimiento baja y el riesgo de lesión sube, por eso nunca lo superamos.",
      en: "Up to 20 hours over a weekend (10 h a day) and up to 30 hours on a 4-day stage. Beyond that performance drops and injury risk rises, so we never go over.",
    },
  },
  {
    category: "entrenament",
    formats: ["cap-de-setmana"],
    q: {
      ca: "Què és un clínic temàtic?",
      es: "¿Qué es un clinic temático?",
      en: "What's a themed clinic?",
    },
    a: {
      ca: "Un cap de setmana centrat en un aspecte concret del joc (víbora, globus, defensa…). A les properes dates veuràs el tema de cada clínic.",
      es: "Un fin de semana centrado en un aspecto concreto del juego (víbora, globo, defensa…). En las próximas fechas verás el tema de cada clinic.",
      en: "A weekend focused on one specific part of the game (víbora, lob, defence…). The upcoming dates list shows each clinic's theme.",
    },
  },
  {
    category: "entrenament",
    formats: ["stage-4-dies"],
    q: {
      ca: "Hi ha temps lliure durant l'stage?",
      es: "¿Hay tiempo libre durante el stage?",
      en: "Is there free time during the stage?",
    },
    a: {
      ca: "Sí. Fins i tot a l'Stage Elite hi ha franges de descans i recuperació. A l'Stage Base tens tardes pràcticament lliures.",
      es: "Sí. Incluso en el Stage Elite hay franjas de descanso y recuperación. En el Stage Base tienes tardes prácticamente libres.",
      en: "Yes. Even on Stage Elite there are rest and recovery slots. On Stage Base your afternoons are mostly free.",
    },
  },
  {
    category: "entrenament",
    q: {
      ca: "He de portar pala?",
      es: "¿Tengo que traer pala?",
      en: "Do I need to bring a racket?",
    },
    a: {
      ca: "Millor si portes la teva, però tenim pales de prova de diverses marques. Les pilotes les posem nosaltres.",
      es: "Mejor si traes la tuya, pero tenemos palas de prueba de varias marcas. Las pelotas las ponemos nosotros.",
      en: "Bring your own if you can, but we have demo rackets from several brands. Balls are on us.",
    },
  },
  {
    category: "allotjament",
    home: true,
    q: {
      ca: "Què inclou exactament el pack?",
      es: "¿Qué incluye exactamente el pack?",
      en: "What exactly does the pack include?",
    },
    a: {
      ca: "Allotjament (1 nit al cap de setmana, 3 nits a l'stage), pensió completa i totes les hores d'entrenament del pack amb material. Cada pack detalla què inclou i què no.",
      es: "Alojamiento (1 noche en el fin de semana, 3 noches en el stage), pensión completa y todas las horas de entrenamiento del pack con material. Cada pack detalla qué incluye y qué no.",
      en: "Accommodation (1 night on the weekend, 3 nights on the stage), full board and every training hour in the pack, equipment included. Each pack lists what is and isn't included.",
    },
  },
  {
    category: "allotjament",
    q: {
      ca: "Les habitacions són compartides?",
      es: "¿Las habitaciones son compartidas?",
      en: "Are rooms shared?",
    },
    a: {
      ca: "Per defecte són dobles compartides. Pots demanar habitació individual com a extra o compartir-la amb qui vinguis.",
      es: "Por defecto son dobles compartidas. Puedes pedir habitación individual como extra o compartirla con quien vengas.",
      en: "By default they're shared doubles. You can add a single room as an extra or share with whoever you come with.",
    },
  },
  {
    category: "allotjament",
    q: {
      ca: "Adapteu els menús a al·lèrgies o dietes?",
      es: "¿Adaptáis los menús a alergias o dietas?",
      en: "Can you adapt menus for allergies or diets?",
    },
    a: {
      ca: "Sí. Indica-ho als comentaris de la sol·licitud i la cuina ho tindrà en compte.",
      es: "Sí. Indícalo en los comentarios de la solicitud y la cocina lo tendrá en cuenta.",
      en: "Yes. Mention it in the request comments and the kitchen will take care of it.",
    },
  },
  {
    category: "pagament",
    home: true,
    q: {
      ca: "Com es paga i què passa si cancel·lo?",
      es: "¿Cómo se paga y qué pasa si cancelo?",
      en: "How do I pay and what if I cancel?",
    },
    a: {
      ca: "Un cop confirmada la plaça es fa una paga i senyal i la resta abans d'arribar. Consulta les condicions a la pàgina Com funciona.",
      es: "Una vez confirmada la plaza se hace una paga y señal y el resto antes de llegar. Consulta las condiciones en la página Cómo funciona.",
      en: "Once your place is confirmed you pay a deposit and the balance before arrival. See the terms on the How it works page.",
    },
  },
  {
    category: "viatge",
    q: {
      ca: "Vinc de fora. Com arribo?",
      es: "Vengo de fuera. ¿Cómo llego?",
      en: "I'm travelling from abroad. How do I get there?",
    },
    a: {
      ca: "A la pàgina d'Instal·lacions tens com arribar en cotxe, tren i avió. També oferim trasllat des de l'aeroport com a extra.",
      es: "En la página de Instalaciones tienes cómo llegar en coche, tren y avión. También ofrecemos traslado desde el aeropuerto como extra.",
      en: "The Facilities page explains how to get here by car, train and plane. We also offer airport transfers as an extra.",
    },
  },
];
