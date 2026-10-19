import { site } from "./site";
import type { L } from "./types";

/**
 * TEXTOS LEGALS — ⚠️ MODEL PROVISIONAL. Revisa'ls amb un professional abans de publicar.
 * Els camps entre [claudàtors] s'han d'omplir (vegeu també src/content/site.ts → legal).
 */
export type LegalPage = "avis-legal" | "privacitat" | "cookies";

export interface LegalSection {
  title: L;
  body: L;
}

const owner = `${site.legal.owner} (${site.legal.taxId})`;
const address = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`;

export const legalUpdated = "2026-10-19";

export const legal: Record<LegalPage, LegalSection[]> = {
  "avis-legal": [
    {
      title: {
        ca: "Titular del web",
        es: "Titular de la web",
        en: "Website owner",
      },
      body: {
        ca: `Aquest web és titularitat de ${owner}, amb domicili a ${address}. Contacte: ${site.email}.`,
        es: `Esta web es titularidad de ${owner}, con domicilio en ${address}. Contacto: ${site.email}.`,
        en: `This website is owned by ${owner}, registered at ${address}. Contact: ${site.email}.`,
      },
    },
    {
      title: {
        ca: "Condicions d'ús",
        es: "Condiciones de uso",
        en: "Terms of use",
      },
      body: {
        ca: "L'accés i l'ús del web impliquen l'acceptació d'aquestes condicions. La informació sobre packs, preus i dates és orientativa i no constitueix una oferta vinculant fins que no es confirma la reserva per escrit.",
        es: "El acceso y uso de la web implican la aceptación de estas condiciones. La información sobre packs, precios y fechas es orientativa y no constituye una oferta vinculante hasta que se confirma la reserva por escrito.",
        en: "Accessing and using this website implies acceptance of these terms. Information about packs, prices and dates is for guidance only and is not a binding offer until the booking is confirmed in writing.",
      },
    },
    {
      title: {
        ca: "Propietat intel·lectual",
        es: "Propiedad intelectual",
        en: "Intellectual property",
      },
      body: {
        ca: "La marca Padel System Academy, el logotip PS, els textos i les imatges del web són propietat del titular o s'utilitzen amb llicència. Queda prohibida la seva reproducció sense autorització.",
        es: "La marca Padel System Academy, el logotipo PS, los textos y las imágenes de la web son propiedad del titular o se utilizan con licencia. Queda prohibida su reproducción sin autorización.",
        en: "The Padel System Academy brand, the PS logo, texts and images on this website belong to the owner or are used under licence. Reproduction without permission is prohibited.",
      },
    },
  ],
  privacitat: [
    {
      title: {
        ca: "Responsable del tractament",
        es: "Responsable del tratamiento",
        en: "Data controller",
      },
      body: {
        ca: `${owner}, ${address}. Correu: ${site.email}.`,
        es: `${owner}, ${address}. Correo: ${site.email}.`,
        en: `${owner}, ${address}. Email: ${site.email}.`,
      },
    },
    {
      title: {
        ca: "Quines dades tractem i per a què",
        es: "Qué datos tratamos y para qué",
        en: "What data we process and why",
      },
      body: {
        ca: "Tractem el nom, el correu, el telèfon i la informació que ens facilites als formularis per respondre la teva sol·licitud, gestionar la reserva i comunicar-nos amb tu. Base legal: el teu consentiment i l'execució de mesures precontractuals.",
        es: "Tratamos el nombre, el correo, el teléfono y la información que nos facilitas en los formularios para responder a tu solicitud, gestionar la reserva y comunicarnos contigo. Base legal: tu consentimiento y la ejecución de medidas precontractuales.",
        en: "We process your name, email, phone and any information you give us in the forms in order to answer your request, manage your booking and communicate with you. Legal basis: your consent and pre-contractual measures.",
      },
    },
    {
      title: {
        ca: "Conservació i destinataris",
        es: "Conservación y destinatarios",
        en: "Retention and recipients",
      },
      body: {
        ca: "Conservem les dades el temps necessari per gestionar la teva sol·licitud i complir obligacions legals. No les cedim a tercers, excepte proveïdors tecnològics necessaris (allotjament web i enviament de correus, com Vercel i Resend) amb les garanties adequades.",
        es: "Conservamos los datos el tiempo necesario para gestionar tu solicitud y cumplir obligaciones legales. No los cedemos a terceros, salvo proveedores tecnológicos necesarios (alojamiento web y envío de correos, como Vercel y Resend) con las garantías adecuadas.",
        en: "We keep data for as long as needed to handle your request and meet legal obligations. We don't share it with third parties except necessary technology providers (web hosting and email delivery, such as Vercel and Resend) under appropriate safeguards.",
      },
    },
    {
      title: { ca: "Els teus drets", es: "Tus derechos", en: "Your rights" },
      body: {
        ca: `Pots exercir els drets d'accés, rectificació, supressió, oposició, limitació i portabilitat escrivint a ${site.email}. També pots presentar una reclamació a l'Autoritat Catalana de Protecció de Dades o a l'AEPD.`,
        es: `Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${site.email}. También puedes presentar una reclamación ante la AEPD.`,
        en: `You can exercise your rights of access, rectification, erasure, objection, restriction and portability by writing to ${site.email}. You may also lodge a complaint with the Spanish Data Protection Agency (AEPD).`,
      },
    },
  ],
  cookies: [
    {
      title: {
        ca: "Què són les cookies",
        es: "Qué son las cookies",
        en: "What cookies are",
      },
      body: {
        ca: "Les cookies són petits fitxers que el web desa al teu navegador per funcionar correctament o recordar preferències.",
        es: "Las cookies son pequeños archivos que la web guarda en tu navegador para funcionar correctamente o recordar preferencias.",
        en: "Cookies are small files a website stores in your browser to work properly or remember preferences.",
      },
    },
    {
      title: {
        ca: "Quines fem servir",
        es: "Cuáles usamos",
        en: "Which ones we use",
      },
      body: {
        ca: "Només fem servir cookies i emmagatzematge local tècnics: la preferència d'idioma (NEXT_LOCALE) i la teva elecció sobre aquest avís. No fem servir cookies analítiques ni publicitàries. Si en el futur n'afegim, te les demanarem abans.",
        es: "Solo usamos cookies y almacenamiento local técnicos: la preferencia de idioma (NEXT_LOCALE) y tu elección sobre este aviso. No usamos cookies analíticas ni publicitarias. Si en el futuro las añadimos, te las pediremos antes.",
        en: "We only use technical cookies and local storage: your language preference (NEXT_LOCALE) and your choice on this notice. We don't use analytics or advertising cookies. If we add any in future, we'll ask you first.",
      },
    },
    {
      title: {
        ca: "Com gestionar-les",
        es: "Cómo gestionarlas",
        en: "How to manage them",
      },
      body: {
        ca: "Pots esborrar o bloquejar les cookies des de la configuració del teu navegador. El mapa de Google Maps de la pàgina de contacte pot instal·lar cookies pròpies de Google en carregar-se.",
        es: "Puedes borrar o bloquear las cookies desde la configuración de tu navegador. El mapa de Google Maps de la página de contacto puede instalar cookies propias de Google al cargarse.",
        en: "You can delete or block cookies in your browser settings. The Google Maps embed on the contact page may set Google's own cookies when it loads.",
      },
    },
  ],
};
