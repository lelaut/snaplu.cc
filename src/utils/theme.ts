import { useEffect } from "react";

export const themes = ["light", "dark"];
export type ThemeName = (typeof themes)[number];

const THEME_KEY = "theme";

export function getTheme(): ThemeName {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function updateTheme(theme: ThemeName) {
  localStorage.setItem(THEME_KEY, theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function switchTheme(): ThemeName {
  const theme = getTheme() === "light" ? "dark" : "light";
  updateTheme(theme);
  return theme;
}

export function useTheme() {
  useEffect(() => {
    if (
      localStorage.getItem(THEME_KEY) === "dark" ||
      (!(THEME_KEY in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
}
