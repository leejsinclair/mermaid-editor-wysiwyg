import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";

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
        projectService: { allowDefaultProject: ["*.config.ts", "*.config.js", "e2e/*.ts"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: "detect" } },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    // The model, validation, generation and history layers stay free of the DOM (see .crews/directives.md).
    files: ["app/model/**", "app/validation/**", "app/generation/**", "app/history/**"],
    languageOptions: { globals: globals.node },
    rules: {
      "no-restricted-globals": [
        "error",
        ...["window", "document", "navigator", "localStorage", "sessionStorage"].map((name) => ({
          name,
          message: "The pure layers must not touch the DOM.",
        })),
      ],
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["react", "react-dom", "react-router", "**/components/**", "**/routes/**"], message: "The pure layers must not import UI code." }] },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}", "*.config.*"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["scripts/**", "*.config.*", "e2e/**"],
    languageOptions: { globals: { ...globals.node } },
    rules: { "security/detect-non-literal-fs-filename": "off" },
  },
);
