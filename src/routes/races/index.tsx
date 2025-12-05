import { Link, createFileRoute } from '@tanstack/react-router'
import { Container, StyledH1 } from '../../components/layout.tsx'
import styled from 'styled-components'
import { renderYmd } from '../../utils/datetime.ts'
import listIcon from '../../assets/list-icon.png'

declare const __RACES_INDEX__: string[]

export const Route = createFileRoute('/races/')({
  loader: () => __RACES_INDEX__,
  component: RacesIndex,
})

const DateList = styled.ul`
  display: flex;
  flex-direction: column;
  margin-left: calc(-1rem - 1px);
  width: calc(100% + 2rem + 2px);
  border-collapse: collapse;
  font-size: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.32);
  padding: 0;
  list-style: none;
  
  li {
    &:before {
      content: '';
      display: inline-block;
      width: 1rem;
      height: 1rem;
      background-image: url(${listIcon});
      background-size: contain;
    }
    background: rgba(43, 43, 43, 0.66);
    padding: 0.25rem 0.5rem;
    font-family: "Russo One", sans-serif;
    font-weight: 400;
    border-bottom: 1px solid rgba(255, 255, 255, 0.32);
    display: flex;
    gap: 0.5rem;
    align-items: center;
    
    &:nth-child(even) {
      background: rgba(93, 93, 93, 0.46);
    }
    
    &:hover {
      background: rgba(175, 75, 0, 0.65);
      color: white;
    }
    
    a {
      color: white;
    }
  }
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
        <DateList>
          {dates
            .slice()
            .sort()
            .reverse()
            .map((d: string) => (
              <li key={d}>
                <Link to="/races/$date" params={{ date: d }}>
                  {renderYmd(d)}
                </Link>
              </li>
            ))}
        </DateList>
      )}
    </Container>
  )
}
