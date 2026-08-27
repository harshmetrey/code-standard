/**
 * @fileoverview Test suite for require-design-system-imports AST ESLint rule.
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/require-design-system-imports');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('require-design-system-imports', rule, {
  valid: [
    {
      code: `import { Button, Text, View } from '@my-org/design-system';`,
    },
    {
      code: `const element = <Button>Click Me</Button>;`,
    },
    {
      code: `import React from 'react'; const Container = () => <div className="wrapper">Content</div>;`,
    },
  ],
  invalid: [
    {
      code: `const element = <button onClick={handleClick}>Submit</button>;`,
      errors: [
        {
          message:
            'Direct usage of primitive HTML tag "<button>" violates organizational design system standards. Import the equivalent component from "@my-org/design-system" instead.',
        },
      ],
    },
    {
      code: `const element = <input type="text" />;`,
      errors: [
        {
          message:
            'Direct usage of primitive HTML tag "<input>" violates organizational design system standards. Import the equivalent component from "@my-org/design-system" instead.',
        },
      ],
    },
    {
      code: `import { Text, View } from 'react-native';`,
      errors: [
        {
          message:
            'Direct import of primitive component "Text" from "react-native" violates architectural boundaries. Import "Text" from "@my-org/design-system" instead.',
        },
        {
          message:
            'Direct import of primitive component "View" from "react-native" violates architectural boundaries. Import "View" from "@my-org/design-system" instead.',
        },
      ],
    },
  ],
});

console.log('✔ Custom AST rule tests passed successfully!');
