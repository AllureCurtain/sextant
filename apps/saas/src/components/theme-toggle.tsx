import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "#/lib/utils";

const STORAGE_KEY = "sextant-theme";
type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * Sun/moon toggle cycling light → dark. Persists to localStorage under
 * `sextant-theme`; the bootstrap script in __root.tsx applies the class
 * before hydration so there is no flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  // Rendered the same on server and first client pass; syncs after mount.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode / blocked storage — the toggle still works for the session.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink-1",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
