/**
 * Minimal Asaas REST v3 client (server-side only). The API key lives ONLY in
 * serverless env vars — never VITE_-prefixed, never shipped to the browser
 * (TIPS #7). Sandbox vs production is switched via ASAAS_BASE_URL.
 */

const BASE_URL = process.env.ASAAS_BASE_URL ?? 'https://sandbox.asaas.com/api/v3'
const API_KEY = process.env.ASAAS_API_KEY ?? ''

interface AsaasFetchInit {
  method: string
  body?: unknown
}

async function asaasFetch<T>(path: string, init: AsaasFetchInit): Promise<T> {
  if (!API_KEY) throw new Error('ASAAS_API_KEY not configured')

  const res = await fetch(`${BASE_URL}${path}`, {
    method: init.method,
    headers: {
      'Content-Type': 'application/json',
      access_token: API_KEY,
      'User-Agent': 'casamento-registry',
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  })

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    const description =
      (data.errors as { description?: string }[] | undefined)?.[0]?.description ??
      `Asaas ${res.status}`
    throw new Error(description)
  }
  return data as T
}

interface AsaasCustomer {
  id: string
}

/**
 * Create (or let Asaas de-dupe) a customer. Asaas requires a CPF/CNPJ at
 * customer creation, so the card form collects it (TIPS #11).
 */
export async function createCustomer(params: {
  name: string
  cpfCnpj: string
}): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>('/customers', {
    method: 'POST',
    body: { name: params.name, cpfCnpj: params.cpfCnpj },
  })
}

interface AsaasPayment {
  id: string
  invoiceUrl: string
}

/**
 * Create a credit-card charge with installment support. We pass `totalValue`
 * (not per-installment `value`) so the couple absorbs the installment split —
 * the guest is charged installments summing to the gift amount (README §5:
 * "you-absorb" is the simpler, more generous default). Change here if you
 * decide to gross-up instead.
 */
export async function createCardPayment(params: {
  customerId: string
  totalValue: number
  installmentCount: number
  dueDate: string
  description: string
  externalReference: string
}): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>('/payments', {
    method: 'POST',
    body: {
      customer: params.customerId,
      billingType: 'CREDIT_CARD',
      totalValue: params.totalValue,
      installmentCount: params.installmentCount,
      dueDate: params.dueDate,
      description: params.description,
      externalReference: params.externalReference,
    },
  })
}

/** Format a Date as YYYY-MM-DD (Asaas dueDate format). */
export function toDueDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}
