// import js from '@eslint/js'
// import globals from 'globals'
// import reactHooks from 'eslint-plugin-react-hooks'
// import reactRefresh from 'eslint-plugin-react-refresh'
// import tseslint from 'typescript-eslint'
// import { globalIgnores } from 'eslint/config'

// export default tseslint.config([
//   globalIgnores(['dist']),
//   {
//     files: ['**/*.{ts,tsx}'],
//     extends: [
//       js.configs.recommended,
//       tseslint.configs.recommended,
//       reactHooks.configs['recommended-latest'],
//       reactRefresh.configs.vite,
//     ],
//     languageOptions: {
//       ecmaVersion: 2020,
//       globals: globals.browser,
//     },
//   },
// ])

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  // Ignorer les dossiers et fichiers générés ou non pertinents
  globalIgnores(["dist", "node_modules", "**/*.css", "**/*.scss", "**/*.less"]),

  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended, // règles JS standard
      tseslint.configs.recommended, // règles TS standard
      reactHooks.configs["recommended-latest"], // règles React Hooks
      reactRefresh.configs.vite, // règles pour Vite + React
    ],
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: __dirname,
      ecmaVersion: 2020,
      sourceType: "module",
    },
    languageOptions: {
      globals: globals.browser, // globals du navigateur
    },
    rules: {
      // Forcer les imports type-only pour TypeScript
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],

      // Permettre les fichiers TS sans warnings inutiles
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],

      // Ajustements pour React
      "react/jsx-uses-react": "off", // React 17+ n'a plus besoin de l'import React
      "react/react-in-jsx-scope": "off",
    },
  },
]);
