import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import './app.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#c9553d" />
        <link rel="icon" type="image/svg+xml" href="/soundblue-monorepo/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/soundblue-monorepo/apple-touch-icon.png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
