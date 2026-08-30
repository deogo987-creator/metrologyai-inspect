import { useEffect } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}

/**
 * Hook for registering keyboard shortcuts.
 * Supports Ctrl/Cmd + key combinations.
 * 
 * Example:
 *   useKeyboardShortcuts({
 *     "ctrl+n": () => navigate("/dashboard/new-inspection"),
 *     "ctrl+d": () => navigate("/dashboard"),
 *   });
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      for (const [combo, handler] of Object.entries(shortcuts)) {
        const parts = combo.toLowerCase().split("+");
        const hasCtrl = parts.includes("ctrl");
        const hasShift = parts.includes("shift");
        const hasAlt = parts.includes("alt");
        const key = parts.filter((p) => !["ctrl", "shift", "alt", "meta"].includes(p))[0];

        if (
          (hasCtrl && !modifier) ||
          (!hasCtrl && modifier && key !== "control") ||
          (hasShift && !e.shiftKey) ||
          (hasAlt && !e.altKey)
        ) {
          continue;
        }

        if (e.key.toLowerCase() === key) {
          e.preventDefault();
          handler();
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
