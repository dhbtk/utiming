import { Link, createFileRoute } from '@tanstack/react-router'
import { Container, StyledH1 } from '../../components/layout.tsx'
import styled from 'styled-components'

declare const __RACES_INDEX__: string[]

export const Route = createFileRoute('/races/')({
  loader: () => __RACES_INDEX__,
  component: RacesIndex,
})

const DateList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

function RacesIndex() {
  const dates = Route.useLoaderData()
  return (
    <Container>
      <StyledH1>
        <Link to="/">uTiming</Link>
        <small>/</small>
        <span>Baterias</span>
      </StyledH1>
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
    </Container>
  )
}
