import { Outlet, Link } from '@tanstack/react-router'
import { createRootRoute } from '@tanstack/react-router'
import styled from 'styled-components'
import { Container } from '../components/layout.tsx'

const OuterWrapper = styled.div`
  width: 100%;
  padding: 1rem 10rem;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1000px) {
    padding: 0.5rem;
    gap: 0.5rem;
  }
`
function Root() {
  return (
    <OuterWrapper>
      <Outlet />
    </OuterWrapper>
  )
}

export const Route = createRootRoute({
  component: Root,
})
