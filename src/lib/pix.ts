import { createStaticPix, hasError } from 'pix-utils'
import QRCode from 'qrcode'

/**
 * Pix BR Code (EMV MPM) builder — runs 100% client-side (no backend, no fees).
 * Everything here is public by nature: the Pix key is embedded in every QR.
 *
 * Field rules the EMV payload enforces (TIPS #1): merchant name <= 25 chars,
 * city <= 15 chars, ASCII only (no accents), txid <= 25 alphanumeric chars.
 */

const PIX_KEY = import.meta.env.VITE_PIX_KEY as string | undefined
const MERCHANT_NAME = (import.meta.env.VITE_PIX_MERCHANT_NAME as string | undefined) ?? ''
const MERCHANT_CITY = (import.meta.env.VITE_PIX_MERCHANT_CITY as string | undefined) ?? ''

/** Strip accents + non-ASCII and uppercase — EMV fields are ASCII-only. */
function toAscii(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/[^\x20-\x7e]/g, '') // ASCII printable only
    .trim()
}

/**
 * Build a short, statement-friendly txid (TIPS #4): `G<index><INITIALS><DDMM>`,
 * uppercased, alphanumeric only, clamped to 25 chars. The index disambiguates
 * gifts; initials + date help you match a bank entry to a guest.
 */
export function buildTxid(giftIndex: number, initials = '', date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const raw = `G${giftIndex}${initials}${dd}${mm}`
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 25)
}

export interface PixPayload {
  brCode: string
  txid: string
}

export interface PixConfigError {
  error: string
}

/**
 * Build the BR Code "copia e cola" string for a fixed amount. Returns a config
 * error object instead of throwing so the UI can show a friendly fallback.
 */
export function buildPixPayload(params: {
  amount: number
  giftIndex: number
  initials?: string
}): PixPayload | PixConfigError {
  if (!PIX_KEY) {
    return { error: 'Pix key not configured (VITE_PIX_KEY).' }
  }
  if (!(params.amount > 0)) {
    return { error: 'Valor inválido.' }
  }

  const txid = buildTxid(params.giftIndex, params.initials ?? '')

  const pix = createStaticPix({
    merchantName: toAscii(MERCHANT_NAME).slice(0, 25),
    merchantCity: toAscii(MERCHANT_CITY).slice(0, 15),
    pixKey: PIX_KEY,
    // Round to 2 decimals to avoid float noise in the EMV amount field.
    transactionAmount: Math.round(params.amount * 100) / 100,
    txid,
  })

  if (hasError(pix)) {
    return { error: pix.message || 'Falha ao gerar o código Pix.' }
  }

  return { brCode: pix.toBRCode(), txid }
}

export function isPixError(x: PixPayload | PixConfigError): x is PixConfigError {
  return 'error' in x
}

/**
 * Render the BR Code as a QR data URL — deliberately dark-on-white with quiet
 * padding so it always scans, even against the blush palette (TIPS #28).
 */
export async function renderPixQr(brCode: string): Promise<string> {
  return QRCode.toDataURL(brCode, {
    errorCorrectionLevel: 'M',
    margin: 2,
    scale: 6,
    color: { dark: '#000000', light: '#ffffff' },
  })
}
