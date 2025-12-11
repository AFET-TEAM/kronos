import { writable } from "svelte/store";

type Theme = "light" | "dark";

const storedTheme =
  typeof window !== "undefined" ? localStorage.getItem("theme") : null;
const initialTheme: Theme = (storedTheme as Theme) || "light";

if (typeof window !== "undefined") {
  if (initialTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export const themeStore = writable<Theme>(initialTheme);

if (typeof window !== "undefined") {
  themeStore.subscribe((theme) => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });
}

export function toggleTheme() {
  themeStore.update((current) => (current === "light" ? "dark" : "light"));
}
