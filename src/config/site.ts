/**
 * Central content config — edit copy, dates and venues here.
 * Keeps the "content inventory" (PLAN 0.5) in one typed place.
 */

export interface VenueInfo {
  label: string
  name: string
  address: string
  mapsUrl?: string
  time?: string
}

export interface ScheduleItem {
  time: string
  title: string
  description?: string
}

export const site = {
  couple: {
    partnerA: 'Maria',
    partnerB: 'João',
    /** Shown in the big script headline */
    monogram: 'M & J',
  },

  /** Wedding date/time in ISO 8601 (local). Drives the countdown. */
  weddingDate: '2026-11-07T16:00:00-03:00',
  weddingDateLabel: '7 de novembro de 2026',

  tagline: 'Vamos nos casar',
  invitationLine: 'Com alegria, convidamos você para celebrar o nosso amor.',

  venues: [
    {
      label: 'Cerimônia',
      name: 'Capela Nossa Senhora',
      address: 'Rua das Flores, 123 — São Paulo, SP',
      time: '16h00',
      mapsUrl: 'https://maps.google.com/?q=Capela+Nossa+Senhora',
    },
    {
      label: 'Recepção',
      name: 'Espaço Jardim',
      address: 'Av. das Palmeiras, 456 — São Paulo, SP',
      time: '18h00',
      mapsUrl: 'https://maps.google.com/?q=Espaco+Jardim',
    },
  ] as VenueInfo[],

  dressCode: 'Traje esporte fino',

  schedule: [
    { time: '16h00', title: 'Cerimônia', description: 'Chegue com 20 minutos de antecedência 🌸' },
    { time: '18h00', title: 'Recepção & Jantar' },
    { time: '20h00', title: 'Festa', description: 'Pista aberta até o amanhecer 🎉' },
  ] as ScheduleItem[],

  rsvp: {
    deadlineLabel: 'até 30 de setembro',
    /** WhatsApp deep-link fallback (zero storage). Digits only, with country code. */
    whatsappNumber: '5511999999999',
  },

  footerNote: 'Os presentes são contribuições simbólicas ao casal ❤️',
} as const

export type Site = typeof site
