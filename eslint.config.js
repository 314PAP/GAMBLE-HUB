/**
 * ESLint flat config pre GambleHub.
 */
import importPlugin from 'eslint-plugin-import';

export default [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        FileReader: 'readonly',
        AudioContext: 'readonly',
        webkitAudioContext: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        JSON: 'readonly',
        Promise: 'readonly',
        Set: 'readonly',
        Map: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/order': ['warn', { 'newlines-between': 'always' }],
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    },
  },
];
