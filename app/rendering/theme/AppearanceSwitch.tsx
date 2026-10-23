import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { en } from "../../text/en";
import type { Appearance } from "./tokens";

interface AppearanceSwitchProps {
  readonly appearance: Appearance;
  readonly onChoose: (appearance: Appearance) => void;
}

/** The two appearances as a labelled pair of toggle buttons, exactly one pressed (spec 007, FR-026). */
export function AppearanceSwitch({ appearance, onChoose }: AppearanceSwitchProps) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      aria-label={en.appearance.label}
      value={appearance}
      onChange={(_event, next: Appearance | null) => {
        if (next !== null) onChoose(next);
      }}
    >
      <ToggleButton value="blueprint">{en.appearance.blueprint}</ToggleButton>
      <ToggleButton value="light">{en.appearance.light}</ToggleButton>
    </ToggleButtonGroup>
  );
}
