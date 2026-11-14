import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.astro/**",
      "**/.wrangler/**",
      "**/.output/**",
      "**/coverage/**",
      "**/routeTree.gen.ts",
      "**/*.gen.ts",
      "**/playwright-report/**",
      "**/test-results/**",
      "docs/**",
      "**/*.config.{js,mjs,ts}",
      "**/*.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts,cts,mjs,cjs,js}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },
  {
    files: ["**/*.{astro}"],
    rules: {
      // Astro files are linted via `astro check`; keep ESLint off the markup.
      "no-undef": "off",
    },
  },
  eslintConfigPrettier,
);
