import { createFileRoute, redirect } from '@tanstack/react-router'

async function fetchIndex(): Promise<string[]> {
  const res = await fetch('/races/index.json', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load races index')
  const list = (await res.json()) as string[]
  return list
}

export const Route = createFileRoute('/')({
  loader: async () => {
    const dates = await fetchIndex()
    if (!dates.length) return null
    const latest = dates.sort().at(-1)!
    throw redirect({ to: '/races/$date', params: { date: latest } })
  },
  component: () => null,
})
