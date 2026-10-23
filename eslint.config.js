import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";


// Layer order (constitution II): model -> validation -> generation -> rendering; history uses model and validation only.
// A restriction block replaces the previous one for the same files, so each block carries the shared bans itself.
const UI_AND_BROWSER_LIBS = [
  "react",
  "react-dom",
  "react-dom/*",
  "react-router",
  "react-router/*",
  "mermaid",
  "@xyflow/*",
  "@mui/*",
  "@emotion/*",
  "**/components/**",
  "**/routes/**",
];
const BROWSER_GLOBALS = [
  "window",
  "document",
  "navigator",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "fetch",
  "BroadcastChannel",
  "crypto",
];
const LAYERS = ["model", "validation", "generation", "rendering", "history", "persistence"];

function bans(group, message) {
  return { group, message };
}

function restrictImports(folder, allowed, { pure, editorOk = false, persistenceOk = false }) {
  const forbiddenLayers = LAYERS.filter((layer) => layer !== folder && !allowed.includes(layer));
  const patterns = [bans(["**/testing/**"], "app/testing is for tests only.")];
  if (forbiddenLayers.length > 0) {
    patterns.push(bans(forbiddenLayers.map((layer) => `**/${layer}/**`), `app/${folder} must not import this layer (layer order).`));
  }
  if (!editorOk) patterns.push(bans(["**/editor/**"], "Only app/routes and app/root.tsx import app/editor."));
  if (!persistenceOk) patterns.push(bans(["**/persistence/**"], "Only app/editor imports app/persistence."));
  if (pure) patterns.push(bans(UI_AND_BROWSER_LIBS, "The pure layers must not import UI or browser libraries."));
  return ["error", { patterns }];
}

function layerRules() {
  const rules = [];
  const layers = {
    model: { allowed: [], pure: true },
    validation: { allowed: ["model"], pure: true },
    generation: { allowed: ["model", "validation"], pure: true },
    history: { allowed: ["model", "validation"], pure: true },
    rendering: { allowed: ["model", "validation", "generation"], pure: false },
    persistence: { allowed: ["model", "validation"], pure: false },
  };
  for (const [folder, { allowed, pure }] of Object.entries(layers)) {
    rules.push({
      files: [`app/${folder}/**/*.{ts,tsx}`],
      ignores: ["**/*.test.{ts,tsx}"],
      ...(pure && { languageOptions: { globals: globals.node } }),
      rules: {
        "no-restricted-imports": restrictImports(folder, allowed, { pure }),
        ...(pure && {
          "no-restricted-globals": [
            "error",
            ...BROWSER_GLOBALS.map((name) => ({ name, message: "The pure layers must not touch browser APIs." })),
          ],
        }),
      },
    });
  }
  // The composition root reaches persistence; routes and the root module reach the editor.
  rules.push({
    files: ["app/editor/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: { "no-restricted-imports": restrictImports("editor", ["model", "validation", "generation", "rendering", "history", "persistence"], { pure: false, editorOk: true, persistenceOk: true }) },
  });
  rules.push({
    files: ["app/routes/**/*.{ts,tsx}", "app/root.tsx"],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: { "no-restricted-imports": restrictImports("routes", ["model", "validation", "generation", "rendering", "history", "persistence"], { pure: false, editorOk: true }) },
  });
  return rules;
}

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "build/**",
      ".react-router/**",
      "playwright-report/**",
      "test-results/**",
      ".specify/**",
      ".crews/**",
      ".claude/**",
      "specs/**",
      "tools/**",
    ],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat.recommended,
  security.configs.recommended,
  sonarjs.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: { allowDefaultProject: ["*.config.ts", "*.config.js"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: "detect" } },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  ...layerRules(),
  {
    files: ["**/*.{js,mjs,cjs}", "*.config.*"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["scripts/**", "*.config.*", "e2e/**"],
    languageOptions: { globals: { ...globals.node } },
    rules: { "security/detect-non-literal-fs-filename": "off" },
  },
  {
    // Tests and fixtures read fixed paths and index with typed keys; no untrusted input reaches them.
    files: ["**/*.test.{ts,tsx}", "app/testing/**", "e2e/**"],
    rules: {
      "security/detect-non-literal-fs-filename": "off",
      "security/detect-object-injection": "off",
    },
  },
);
