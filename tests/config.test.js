/**
 * @fileoverview Test suite for configuration export validity.
 */

'use strict';

const assert = require('assert');

const baseConfig = require('../index.js');
const reactConfig = require('../react.js');
const reactNativeConfig = require('../react-native.js');
const prettierConfig = require('../prettier.config.js');
const rulesPlugin = require('../rules');

// 1. Verify plugin rules export
assert(rulesPlugin.rules['require-design-system-imports'], 'Custom AST rule must be exported in rules/index.js');

// 2. Verify Base Config Structure
assert.strictEqual(baseConfig.parser, '@typescript-eslint/parser');
assert(Array.isArray(baseConfig.extends), 'baseConfig.extends must be an array');
assert(Array.isArray(baseConfig.plugins), 'baseConfig.plugins must be an array');
assert(baseConfig.rules['@harsh_metrey/code-standard/require-design-system-imports'], 'Base config must register custom AST rule');

// 3. Verify React Config Structure
assert(reactConfig.extends.includes('./index.js'), 'React config must extend base index.js');
assert(reactConfig.plugins.includes('react'), 'React config must include react plugin');
assert.strictEqual(reactConfig.rules['react-hooks/rules-of-hooks'], 'error');

// 4. Verify React Native Config Structure
assert(reactNativeConfig.extends.includes('./index.js'), 'React Native config must extend base index.js');
assert(reactNativeConfig.plugins.includes('react-native'), 'React Native config must include react-native plugin');
assert.strictEqual(reactNativeConfig.rules['react-native/no-inline-styles'], 'error');

// 5. Verify Prettier Config
assert.strictEqual(prettierConfig.singleQuote, true);
assert.strictEqual(prettierConfig.trailingComma, 'all');

console.log('✔ Configuration structure audit passed successfully!');
