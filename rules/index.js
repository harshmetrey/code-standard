/**
 * @fileoverview Custom ESLint rules plugin definition for @my-org/code-standard.
 * @author Staff Platform Engineer (DevEx)
 */

'use strict';

const requireDesignSystemImports = require('./require-design-system-imports');

module.exports = {
  rules: {
    'require-design-system-imports': requireDesignSystemImports,
  },
};
