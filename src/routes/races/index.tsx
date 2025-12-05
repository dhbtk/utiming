import { Link, createFileRoute } from '@tanstack/react-router'

async function fetchIndex(): Promise<string[]> {
  const res = await fetch('/races/index.json', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load races index')
  return (await res.json()) as string[]
}

export const Route = createFileRoute('/races/')({
  loader: () => fetchIndex(),
  component: RacesIndex,
})

function RacesIndex() {
  const dates = Route.useLoaderData()
  return (
    <div>
      <h1>Races</h1>
      {!dates.length ? (
        <p>No races available.</p>
      ) : (
        <ul>
          {dates
            .slice()
            .sort()
            .reverse()
            .map((d: string) => (
              <li key={d}>
                <Link to="/races/$date" params={{ date: d }}>
                  {d}
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
