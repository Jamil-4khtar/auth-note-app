import { Sun, Moon } from "lucide-react";

/**
 * If you want to use this button in different places (floating or inline),
 * pass an optional `className` prop to override the default styles.
 */
export default function DarkModeToggle({ darkMode, toggleDarkMode, className = "" }) {
  return (
    <button
      onClick={toggleDarkMode}
      className={
        className ||
        "fixed top-6 right-6 z-50 p-3 rounded-full border border-border dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 shadow-lg hover:scale-105 transition-all duration-200 backdrop-blur"
      }
      aria-label="Toggle dark mode"
      type="button"
    >
      {darkMode ? (
        <Sun className="h-6 w-6 text-yellow-400" />
      ) : (
        <Moon className="h-6 w-6 text-blue-400" />
      )}
    </button>
  );
}