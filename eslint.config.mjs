import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { configs, plugins } from 'eslint-config-airbnb-extended';

const gitignorePath = path.resolve('.', '.gitignore');

const jsConfig = defineConfig([
  // ESLint recommended config
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  // Stylistic plugin
  plugins.stylistic,
  // Import X plugin
  plugins.importX,
  // Airbnb base recommended config
  ...configs.base.recommended,
]);

const reactConfig = defineConfig([
  // React plugin
  plugins.react,
  // React hooks plugin
  plugins.reactHooks,
  // React JSX A11y plugin
  plugins.reactA11y,
  // Airbnb React recommended config
  ...configs.react.recommended,
]);

const typescriptConfig = defineConfig([
  // TypeScript ESLint plugin
  plugins.typescriptEslint,
  // Airbnb base TypeScript config
  ...configs.base.typescript,
  // Airbnb React TypeScript config
  ...configs.react.typescript,

  // Ajustes del proyecto
  {
    name: 'eventify/ajustes',
    rules: {
      // Desde React 17 no hace falta importar React en cada archivo con JSX.
      'react/react-in-jsx-scope': 'off',
      // Git guarda los archivos con LF; en Windows la carpeta los muestra con CRLF.
      '@stylistic/linebreak-style': 'off',
      // Con TypeScript, las props opcionales se marcan con "?" y sus valores por defecto
      // van en la desestructuración.
      'react/require-default-props': 'off',
      // Los services, hooks y utilidades exportan con nombre a propósito.
      'import-x/prefer-default-export': 'off',
      // Su arreglo automático parte el texto de JSX en muchas líneas y puede comerse espacios.
      'react/jsx-one-expression-per-line': 'off',
      // Mismas excepciones que la guía original de Airbnb: los textos largos no cuentan.
      '@stylistic/max-len': ['error', {
        code: 100,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      }],
    },
  },
  // Los tests pueden usar devDependencies.
  {
    name: 'eventify/tests',
    files: ['src/**/*.test.{ts,tsx}', 'src/setupTests.ts'],
    rules: {
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
]);

export default defineConfig([
  // Ignore files and folders listed in .gitignore
  includeIgnoreFile(gitignorePath),
  // JavaScript config
  ...jsConfig,
  // React config
  ...reactConfig,
  // TypeScript config
  ...typescriptConfig,
]);
