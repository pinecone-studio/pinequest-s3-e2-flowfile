import { defineConfig, globalIgnores } from "eslint/config";
import nextEslintPluginNext from "@next/eslint-plugin-next";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@next/next": nextEslintPluginNext,
      "@typescript-eslint": tsEslintPlugin,
    },
    rules: {
      ...tsEslintPlugin.configs.recommended.rules,
      ...nextEslintPluginNext.configs.recommended.rules,
      ...nextEslintPluginNext.configs["core-web-vitals"].rules,
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variableLike",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      complexity: ["error", 4],
      "max-lines": [
        "error",
        {
          max: 150,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-lines-per-function": [
        "error",
        {
          max: 180,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    plugins: { "@next/next": nextEslintPluginNext },
    rules: {
      ...nextEslintPluginNext.configs.recommended.rules,
      ...nextEslintPluginNext.configs["core-web-vitals"].rules,
      complexity: ["error", 4],
      "max-lines": [
        "error",
        {
          max: 150,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-lines-per-function": [
        "error",
        {
          max: 180,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "out/**",
    "dist/**",
    "**/out-tsc",
  ]),
]);

export default eslintConfig;
