import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

export default tseslint.config([
  globalIgnores(['dist', 'dev-dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Our form controls are wrapped in design-system components (and react-hook-form's
      // <Controller>), so the rule can't statically see the control nested inside the <label>.
      // The nesting itself is a valid implicit label association.
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          depth: 4,
          controlComponents: ['Controller', 'Input', 'Select', 'Textarea'],
        },
      ],
    },
  },
  {
    // Route config, not a component module: it exports the router object alongside the lazy()
    // component bindings it wires up. Fast-refresh's single-export rule doesn't apply here.
    files: ['src/app/router.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // UI layers must go through data/repositories — never touch storage or the browser API directly.
    // This is what makes swapping localStorage for an HTTP backend in Phase 2 a data/ -only change.
    files: ['src/features/**', 'src/design-system/**', 'src/app/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/data/storage/**', '**/data/storage'],
              message: 'UI code must not import the storage layer directly — use a repository from data/repositories.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'Use the corresponding repository instead of localStorage directly.' },
      ],
    },
  },
]);
