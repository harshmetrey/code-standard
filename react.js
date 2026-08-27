/**
 * @fileoverview React ESLint configuration for @my-org/code-standard.
 * Extends the base TypeScript configuration and adds React, React Hooks, and JSX Accessibility rules.
 * @author Staff Platform Engineer (DevEx)
 */

'use strict';

module.exports = {
  extends: [
    './index.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier', // Ensure Prettier overrides any conflicting React rules
  ],
  plugins: ['react', 'react-hooks', 'jsx-a11y'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // ------------------------------------------------------------------------
    // React Specific Best Practices
    // ------------------------------------------------------------------------
    'react/react-in-jsx-scope': 'off', // Not required with React 17+ JSX Transform
    'react/prop-types': 'off', // TypeScript handles component prop typing
    'react/display-name': 'off',
    'react/self-closing-comp': ['error', { component: true, html: true }],
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-curly-brace-presence': [
      'error',
      { props: 'never', children: 'never' },
    ],

    // ------------------------------------------------------------------------
    // React Hooks Rules
    // ------------------------------------------------------------------------
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ------------------------------------------------------------------------
    // Accessibility Rules (jsx-a11y)
    // ------------------------------------------------------------------------
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
  },
};
