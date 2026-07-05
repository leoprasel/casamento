const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/** Format a number as Brazilian Real, e.g. 250 -> "R$ 250,00". */
export function formatBRL(value: number): string {
  return brl.format(value)
}
