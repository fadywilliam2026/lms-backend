// @ts-check

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const parser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');
const eslintPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, prettierConfig, {
  settings: {
    root: true,
    env: {
      node: true,
      jest: true,
    },
  },

  plugins: { eslintPlugin },
  languageOptions: {
    parser,
    parserOptions: {
      project: 'tsconfig.json',
      tsconfigRootDir: __dirname,
      sourceType: 'module',
    },
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  ignores: ['.eslint.config.js'],
});
