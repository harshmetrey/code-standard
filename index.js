/**
 * @fileoverview Base ESLint configuration for @my-org/code-standard.
 * Includes TypeScript strict rules, import sorting, design system AST enforcement, and Prettier integration.
 * @author Staff Platform Engineer (DevEx)
 */

'use strict';

const rulesPlugin = require('./rules');

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    es2022: true,
    node: true,
    browser: true,
  },
  plugins: [
    '@typescript-eslint',
    'simple-import-sort',
    'import',
    'prettier',
    '@harsh_metrey/code-standard',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // Removes formatting rules that conflict with Prettier
  ],
  rules: {
    // ------------------------------------------------------------------------
    // Custom Architectural Governance Rules
    // ------------------------------------------------------------------------
    '@harsh_metrey/code-standard/require-design-system-imports': 'error',

    // ------------------------------------------------------------------------
    // Import Sorting & Module Organization Rules
    // ------------------------------------------------------------------------
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // 1. Side effect imports (e.g. import './styles.css')
          ['^\\u0000'],
          // 2. Node.js builtins & React/Framework packages
          ['^react', '^@?\\w'],
          // 3. Design System & Internal Org packages
          ['^@my-org/'],
          // 4. Absolute imports & internal aliases (e.g. @/components)
          ['^@/'],
          // 5. Relative imports (e.g. ../, ./)
          ['^\\.', '^\\./'],
          // 6. Style imports
          ['^.+\\.(module\\.css|css|scss|less)$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'off', // TypeScript compiler handles unresolved checks

    // ------------------------------------------------------------------------
    // TypeScript Strictness & Code Quality
    // ------------------------------------------------------------------------
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],

    // ------------------------------------------------------------------------
    // Prettier Formatting Integration
    // ------------------------------------------------------------------------
    'prettier/prettier': ['error', require('./prettier.config.js')],
  },
};
