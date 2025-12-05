import styled from 'styled-components'

export const Container = styled.div`
  padding: 1rem;
  background: color-mix(in srgb, rgba(197, 0, 0, 0.55), black 60%);
  backdrop-filter: blur(5px);
  border-radius: 0.5rem;
  border: 1px solid rgba(197, 0, 0, 0.25);
  box-shadow: 0.35rem 0.35rem 0.5rem rgba(0, 0, 0, 0.55);
`
export const StyledH1 = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  padding: 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: "Russo One", sans-serif;

  a:not(.unstyled), small {
    font-size: 0.75rem;
    color: rgba(126, 126, 126, 0.71);
  }
  
  a:not(.unstyled):hover {
    text-decoration: underline;
  }
`
