// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="ko" data-theme="light">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* FOUC Prevention: Apply theme before paint */}
          <script
            textContent={`(function(){try{var t=localStorage.getItem('dialogue-theme');if(t==='dark'){document.documentElement.dataset.theme='dark';document.documentElement.style.colorScheme='dark'}}catch(e){}})();`}
          />
          <meta name="theme-color" content="#F7FAFA" />
          <meta name="description" content="Dialogue - A conversational learning tool that works 100% offline" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" type="image/png" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
