import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useToast } from "./toast";

/*
 * Browser-only favourites (the concept's save heart). Nothing is sent to the
 * server; storage access is wrapped because it can throw in private modes.
 */

const STORAGE_KEY = "pfl:saved-stays";

interface SavedStays {
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => void;
}

const SavedStaysContext = createContext<SavedStays>({
  isSaved: () => false,
  toggle: () => {},
});

function readSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function writeSaved(slugs: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Storage unavailable: favourites last for this page view only.
  }
}

export function SavedStaysProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const toast = useToast();

  // Load after hydration so the server and first client render match.
  useEffect(() => setSaved(readSaved()), []);

  const toggle = useCallback(
    (slug: string) => {
      const wasSaved = saved.includes(slug);
      const next = wasSaved ? saved.filter((s) => s !== slug) : [...saved, slug];
      setSaved(next);
      writeSaved(next);
      toast(wasSaved ? "Removed from favourites" : "Saved to your favourites");
    },
    [saved, toast],
  );

  const value = useMemo<SavedStays>(
    () => ({ isSaved: (slug) => saved.includes(slug), toggle }),
    [saved, toggle],
  );

  return (
    <SavedStaysContext.Provider value={value}>
      {children}
    </SavedStaysContext.Provider>
  );
}

export function useSavedStays(): SavedStays {
  return useContext(SavedStaysContext);
}
