import * as React from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewTransitionLike {
  ready: Promise<void>;
}

interface ViewTransitionDocument extends Document {
  startViewTransition?: (callback: () => void) => ViewTransitionLike;
}

const ThemeToggle = ({ children }: { children?: React.ReactNode }) => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  const handleToggle = (event: React.MouseEvent | React.KeyboardEvent) => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    const doc = document as ViewTransitionDocument;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!doc.startViewTransition || prefersReducedMotion) {
      setTheme(nextTheme);
      return;
    }

    let x = "clientX" in event ? event.clientX : 0;
    let y = "clientY" in event ? event.clientY : 0;
    if (x === 0 && y === 0) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(nextTheme));
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 450,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle(event);
    }
  };

  if (children) {
    return React.isValidElement(children) ? (
      React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        onClick: handleToggle,
        onKeyDown: handleKeyDown,
        role: "button",
        tabIndex: 0,
        "aria-label": "Toggle theme",
      })
    ) : (
      children
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative overflow-hidden"
      aria-label="Toggle theme"
      onClick={handleToggle}
    >
      <Sun
        className={cn(
          "h-[1.2rem] w-[1.2rem] transition-all duration-500",
          currentTheme === "dark" ? "-rotate-90 scale-0" : "rotate-0 scale-100"
        )}
      />
      <Moon
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] transition-all duration-500",
          currentTheme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
        )}
      />
    </Button>
  );
};

export default ThemeToggle;
