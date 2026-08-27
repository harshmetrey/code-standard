/**
 * @fileoverview ESLint rule to enforce using @my-org/design-system components instead of raw HTML elements or primitive React Native components.
 * @author Staff Platform Engineer (DevEx)
 */

'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce importing UI components from @my-org/design-system instead of using primitive HTML tags or raw React Native primitives.',
      category: 'Architectural Governance',
      recommended: true,
    },
    fixable: null, // Can be extended with auto-fix logic in future iterations
    schema: [
      {
        type: 'object',
        properties: {
          designSystemPackage: {
            type: 'string',
            default: '@my-org/design-system',
          },
          forbiddenHtmlElements: {
            type: 'array',
            items: { type: 'string' },
            default: ['button', 'input', 'select', 'textarea', 'a'],
          },
          forbiddenReactNativePrimitives: {
            type: 'array',
            items: { type: 'string' },
            default: [
              'Text',
              'View',
              'TouchableOpacity',
              'TouchableHighlight',
              'TouchableWithoutFeedback',
              'Pressable',
              'Button',
              'TextInput',
              'ScrollView',
              'FlatList',
            ],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      avoidPrimitiveHtml:
        'Direct usage of primitive HTML tag "<{{ name }}>" violates organizational design system standards. Import the equivalent component from "{{ designSystemPackage }}" instead.',
      avoidPrimitiveReactNative:
        'Direct import of primitive component "{{ name }}" from "react-native" violates architectural boundaries. Import "{{ name }}" from "{{ designSystemPackage }}" instead.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const designSystemPackage =
      options.designSystemPackage || '@my-org/design-system';
    const forbiddenHtmlElements = new Set(
      options.forbiddenHtmlElements || ['button', 'input', 'select', 'textarea', 'a']
    );
    const forbiddenReactNativePrimitives = new Set(
      options.forbiddenReactNativePrimitives || [
        'Text',
        'View',
        'TouchableOpacity',
        'TouchableHighlight',
        'TouchableWithoutFeedback',
        'Pressable',
        'Button',
        'TextInput',
        'ScrollView',
        'FlatList',
      ]
    );

    return {
      // 1. Inspect JSX elements for direct HTML tags (e.g., <button>, <input>)
      JSXOpeningElement(node) {
        if (node.name.type === 'JSXIdentifier') {
          const elementName = node.name.name;
          if (forbiddenHtmlElements.has(elementName)) {
            context.report({
              node,
              messageId: 'avoidPrimitiveHtml',
              data: {
                name: elementName,
                designSystemPackage,
              },
            });
          }
        }
      },

      // 2. Inspect Import Declarations for forbidden React Native primitives
      ImportDeclaration(node) {
        if (node.source.value === 'react-native') {
          node.specifiers.forEach((specifier) => {
            if (
              specifier.type === 'ImportSpecifier' &&
              forbiddenReactNativePrimitives.has(specifier.imported.name)
            ) {
              context.report({
                node: specifier,
                messageId: 'avoidPrimitiveReactNative',
                data: {
                  name: specifier.imported.name,
                  designSystemPackage,
                },
              });
            }
          });
        }
      },
    };
  },
};
