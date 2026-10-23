import { useSyncExternalStore } from "react";
import { layoutFor, type Layout } from "./layout";

const subscribe = (listener: () => void): (() => void) => {
  window.addEventListener("resize", listener);
  return () => {
    window.removeEventListener("resize", listener);
  };
};

/** How the workspace is arranged for the window's width now; it re-renders only when the arrangement changes, not on every resize. */
export const useLayout = (): Layout => useSyncExternalStore(subscribe, () => layoutFor(window.innerWidth), () => "wide");
