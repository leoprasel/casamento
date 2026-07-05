import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { getGiftById, resolveAmount } from './_lib/gifts'
import { createCustomer, createCardPayment, toDueDate } from './_lib/asaas'
import { applyCors, rateLimited } from './_lib/http'

/**
 * POST /api/card-checkout (PLAN 5.1)
 *
 * Creates an Asaas credit-card charge (with installments) for a gift and
 * returns the hosted `invoiceUrl` for the frontend to redirect to. Card data
 * never touches this code — the guest types it on Asaas's page (no PCI scope).
 */

const MAX_INSTALLMENTS = Number(process.env.MAX_INSTALLMENTS ?? 6)

const bodySchema = z.object({
  giftId: z.string().min(1),
  installments: z.number().int().min(1).max(MAX_INSTALLMENTS).default(1),
  guestName: z.string().min(1).max(80),
  // Asaas requires a CPF at customer creation (TIPS #11). Digits only.
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
  customAmount: z.number().positive().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (rateLimited(req)) {
    res.status(429).json({ error: 'Muitas tentativas. Aguarde um instante.' })
    return
  }

  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }
  const { giftId, installments, guestName, cpf, customAmount } = parsed.data

  // Price is resolved SERVER-SIDE from our own catalog (TIPS #8).
  const gift = getGiftById(giftId)
  if (!gift) {
    res.status(404).json({ error: 'Presente não encontrado' })
    return
  }
  const amount = resolveAmount(gift, customAmount)
  if (amount === null) {
    res.status(400).json({ error: 'Valor inválido para este presente' })
    return
  }

  try {
    const customer = await createCustomer({ name: guestName, cpfCnpj: cpf })
    const payment = await createCardPayment({
      customerId: customer.id,
      totalValue: amount,
      installmentCount: installments,
      dueDate: toDueDate(3),
      description: `Presente: ${gift.title} — ${guestName}`,
      externalReference: gift.id,
    })

    res.status(200).json({ invoiceUrl: payment.invoiceUrl })
  } catch (err) {
    // Keep the guest's path open: the frontend falls back to Pix on any error.
    const message = err instanceof Error ? err.message : 'Erro ao criar cobrança'
    res.status(502).json({ error: message })
  }
}
