/**
 * @fileoverview React Native ESLint configuration for @my-org/code-standard.
 * Extends base TypeScript & React configurations and adds React Native enforcement rules.
 * @author Staff Platform Engineer (DevEx)
 */

'use strict';

module.exports = {
  extends: [
    './index.js',
    './react.js',
    'plugin:react-native/all',
    'prettier', // Ensure Prettier overrides any conflicting React Native styling rules
  ],
  plugins: ['react-native'],
  env: {
    'react-native/react-native': true,
  },
  rules: {
    // ------------------------------------------------------------------------
    // React Native Enforcement & Architectural Boundaries
    // ------------------------------------------------------------------------
    'react-native/no-inline-styles': 'error', // Enforce StyleSheet or styled abstractions
    'react-native/no-color-literals': 'warn', // Discourage inline hex/rgb colors in favor of theme tokens
    'react-native/no-raw-text': [
      'error',
      {
        skip: ['Typography', 'FormattedMessage', 'Text'],
      },
    ], // Enforce wrapping text in Typography / Text components
    'react-native/no-single-element-style-arrays': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-unused-styles': 'error',

    // Relax certain overly strict react-native/all rules for practical DevEx
    'react-native/sort-styles': 'off', // simple-import-sort & Prettier manage formatting
  },
};
