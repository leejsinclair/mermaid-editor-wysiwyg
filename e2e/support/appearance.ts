import { test } from "@playwright/test";

export const APPEARANCES = ["blueprint", "light"] as const;

export type Appearance = (typeof APPEARANCES)[number];

/** Defines the tests of `define` once for each appearance, the page opening in that appearance as if it had been chosen and remembered. */
export function eachAppearance(define: (appearance: Appearance) => void): void {
  for (const appearance of APPEARANCES) {
    test.describe(`in the ${appearance} appearance`, () => {
      test.beforeEach(async ({ context }) => {
        await context.addInitScript((chosen) => {
          localStorage.setItem("mermaid-editor.appearance", chosen);
        }, appearance);
      });
      define(appearance);
    });
  }
}
