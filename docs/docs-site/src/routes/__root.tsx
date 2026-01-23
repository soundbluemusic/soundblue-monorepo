import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import '../app.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#c9553d' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/soundblue-monorepo/favicon.svg' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/soundblue-monorepo/apple-touch-icon.png' },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
