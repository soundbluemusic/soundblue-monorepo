import {
  createContext,
  useContext,
  createSignal,
  ParentComponent,
  onMount,
} from "solid-js";

export type Theme = "dark" | "light";

type ThemeContextType = {
  theme: () => Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>();

const STORAGE_KEY = "dialogue-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

export const ThemeProvider: ParentComponent = (props) => {
  const [theme, setThemeState] = createSignal<Theme>("dark");

  onMount(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme() === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
