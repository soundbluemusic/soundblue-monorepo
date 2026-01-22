import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

// React Router v7 SSG hydration bug workaround
setTimeout(() => {
  const divs = [...document.body.children].filter((el) => el.tagName === 'DIV');
  if (divs.length >= 2 && !Object.keys(divs[0]).some((k) => k.startsWith('__react'))) {
    divs[0].remove();
  }
}, 100);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
