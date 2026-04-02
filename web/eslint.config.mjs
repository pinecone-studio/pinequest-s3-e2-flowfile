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
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    plugins: { "@next/next": nextEslintPluginNext },
    rules: {
      ...nextEslintPluginNext.configs.recommended.rules,
      ...nextEslintPluginNext.configs["core-web-vitals"].rules,
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
