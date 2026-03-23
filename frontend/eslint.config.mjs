import { defineConfig, globalIgnores } from "eslint/config";
import nextEslintPluginNext from "@next/eslint-plugin-next";
import nx from "@nx/eslint-plugin";
import baseConfig from "../../eslint.config.mjs";

const eslintConfig = defineConfig([
  { plugins: { "@next/next": nextEslintPluginNext } },
  ...baseConfig,
  ...nx.configs["flat/react-typescript"],
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
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
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "out/**",
    "dist/**",
    "**/out-tsc",
  ]),
]);

export default eslintConfig;
