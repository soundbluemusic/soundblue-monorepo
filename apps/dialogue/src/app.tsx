import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { I18nProvider } from "~/i18n/context";
import { ThemeProvider } from "~/theme";
import "./styles/global.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Dialogue - Conversational Learning Tool</Title>
          <ThemeProvider>
            <I18nProvider>
              <Suspense>{props.children}</Suspense>
            </I18nProvider>
          </ThemeProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
