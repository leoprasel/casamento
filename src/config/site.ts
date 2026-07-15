/**
 * Central content config — edit copy, dates and venue here.
 * Values marked "[ ... ]" are placeholders from the design handoff awaiting
 * the couple's real details.
 */

export const site = {
  couple: {
    partnerA: 'Leonardo',
    partnerB: 'Isabela',
    /** "Leonardo & Isabela · 11.09.2027" — reused as an eyebrow across pages. */
    line: 'Leonardo & Isabela · 11.09.2027',
  },

  /** Wedding date/time in ISO 8601. Drives the countdown. */
  weddingDate: '2027-09-11T16:00:00-03:00',
  weddingDateLabel: '11 de setembro de 2027',
  weddingDateShort: '11 · 09 · 2027',

  invitationLine:
    'convidam você para celebrar o dia em que suas vidas se tornarão uma só história.',

  venue: {
    name: 'Chácara Llar',
    addressLines: [
      'Estr. Lourenço Baggio Coradin, 1150',
      'Jardim Daher · Campina Grande do Sul — PR',
      'CEP 83430-000',
    ],
    mapsUrl: 'https://maps.app.goo.gl/XHdUbXLWonry7ZRF6',
  },

  dressCode: {
    label: 'Esporte fino',
    // Placeholder note from the design.
    note: '[ Paleta e detalhes a definir — pedimos que evitem o branco, reservado à noiva. ]',
  },

  rsvp: {
    /** WhatsApp deep-link fallback (zero storage). Digits only, with country code. */
    whatsappNumber: '5511999999999',
  },
} as const

export type Site = typeof site
