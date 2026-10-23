import { createContext, useContext } from "react";
import type { Appearance } from "./tokens";

/** The appearance in use, how to change it, and whether the last change could be kept for the next visit (spec 007, FR-026). */
export interface AppearanceState {
  readonly appearance: Appearance;
  /** Switches at once and returns whether the choice was kept for the next visit. */
  readonly choose: (appearance: Appearance) => boolean;
  readonly kept: boolean;
}

export const AppearanceContext = createContext<AppearanceState>({ appearance: "blueprint", choose: () => true, kept: true });

export const useAppearance = (): AppearanceState => useContext(AppearanceContext);
