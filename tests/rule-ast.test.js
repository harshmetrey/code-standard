/**
 * @fileoverview Standalone AST rule logic unit test.
 */

'use strict';

const assert = require('assert');
const rule = require('../rules/require-design-system-imports');

console.log('🧪 Testing require-design-system-imports AST traversal logic...');

let reports = [];
const mockContext = {
  options: [{ designSystemPackage: '@my-org/design-system' }],
  report(info) {
    reports.push(info);
  },
};

const visitor = rule.create(mockContext);

// Test 1: JSXOpeningElement with primitive <button>
reports = [];
visitor.JSXOpeningElement({
  name: { type: 'JSXIdentifier', name: 'button' },
});
assert.strictEqual(reports.length, 1, 'Should flag <button> tag');
assert.strictEqual(reports[0].messageId, 'avoidPrimitiveHtml');
assert.strictEqual(reports[0].data.name, 'button');

// Test 2: JSXOpeningElement with primitive <input>
reports = [];
visitor.JSXOpeningElement({
  name: { type: 'JSXIdentifier', name: 'input' },
});
assert.strictEqual(reports.length, 1, 'Should flag <input> tag');
assert.strictEqual(reports[0].messageId, 'avoidPrimitiveHtml');

// Test 3: JSXOpeningElement with Design System component <Button>
reports = [];
visitor.JSXOpeningElement({
  name: { type: 'JSXIdentifier', name: 'Button' },
});
assert.strictEqual(reports.length, 0, 'Should not flag custom <Button> component');

// Test 4: ImportDeclaration from react-native
reports = [];
visitor.ImportDeclaration({
  source: { value: 'react-native' },
  specifiers: [
    { type: 'ImportSpecifier', imported: { name: 'Text' } },
    { type: 'ImportSpecifier', imported: { name: 'View' } },
  ],
});
assert.strictEqual(reports.length, 2, 'Should flag Text and View imports from react-native');
assert.strictEqual(reports[0].messageId, 'avoidPrimitiveReactNative');

console.log('✔ Standalone AST Rule unit tests passed 100%!');
