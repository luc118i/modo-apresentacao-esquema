import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/lib/useTheme";
import { Button } from "./Button";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" onClick={toggle} aria-label="Alternar tema" className="px-2">
      {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </Button>
  );
}
