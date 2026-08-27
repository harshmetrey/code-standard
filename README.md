# `@harsh_metrey/code-standard`

> Zero-config, enterprise-grade ESLint and Prettier standard for React, React Native, and TypeScript codebases.

---

## 💡 Architectural Vision & DevEx Philosophy

In large engineering organizations, developer productivity is often degraded by **Configuration Fatigue**, fragmented linting rules, inconsistent code styles, and manual IDE setups. 

`@harsh_metrey/code-standard` was built by the Platform Engineering team to solve these pain points through three core principles:

1. **Zero Configuration Fatigue**: Standardize TypeScript, React, React Native, and Prettier rules across all micro-frontends and mobile applications with a single dependency.
2. **Architectural Governance via Custom AST Rules**: Enforce design system adoption (`@my-org/design-system`) statically at compile-time using AST traversal rules, eliminating raw HTML tags and unstyled React Native primitives.
3. **Automated IDE & Git Hook Provisioning ("The Wow Factor")**: One-command initialization (`npx @harsh_metrey/code-standard init`) provisions `.eslintrc.js`, `.prettierrc.js`, VS Code auto-fix on save, and Husky/lint-staged pre-commit hooks out-of-the-box.

---

## 📦 Package Architecture & Module Exports

The package is built with a modular export structure so projects can consume or extend configurations tailored to their target runtime environment:

| Export Specifier | Description | Target Codebase |
|---|---|---|
| `@harsh_metrey/code-standard` | Base config (TypeScript strict rules, import sorting, AST rules, Prettier) | Node.js / Shared TS packages |
| `@harsh_metrey/code-standard/react` | Extends base + React hooks + JSX accessibility (`jsx-a11y`) | React Web & Next.js Apps |
| `@harsh_metrey/code-standard/react-native` | Extends base + React Native enforcement (no inline styles, raw text checks) | React Native / Expo Apps |
| `@harsh_metrey/code-standard/prettier` | Shared enterprise Prettier formatting configuration | All codebases |

> [!NOTE]
> `eslint-config-prettier` is integrated as the final layer in all export targets to guarantee that ESLint never conflicts with Prettier formatting rules.

---

## 📖 Step-by-Step "How to Use" Guide

### ⚡ Option 1: 1-Step Automated CLI Setup (Recommended)

Run the DevEx CLI wizard inside any target project root directory:

```bash
npx @harsh_metrey/code-standard init
```

#### What the CLI Automates in 3 Seconds:
1. 🔍 **Auto-Detects Environment**: Inspects `package.json` to select the right preset (`react-native`, `react`, or `base`).
2. 📝 **Generates Configuration Files**:
   - `.eslintrc.js`: Extends `@harsh_metrey/code-standard` matching your project preset.
   - `.prettierrc.js`: Extends `@harsh_metrey/code-standard/prettier`.
3. ⚙️ **Provisions VS Code Settings (`.vscode/settings.json`)**:
   - Enables **Format on Save** via Prettier (`editor.formatOnSave: true`).
   - Enables **Auto-Fix on Save** via ESLint (`editor.codeActionsOnSave: { "source.fixAll.eslint": "explicit" }`).
4. 🪝 **Provisions Git Hooks (`husky` & `lint-staged`)**:
   - Updates `package.json` with `"prepare": "husky install"` and `lint-staged` rules.
   - Creates an executable `.husky/pre-commit` script to format and lint staged files automatically on `git commit`.

---

### 🛠️ CLI Options & Flags

```bash
# Force preset selection manually
npx @harsh_metrey/code-standard init --preset react-native
npx @harsh_metrey/code-standard init --preset react
npx @harsh_metrey/code-standard init --preset base

# Overwrite existing config files (.eslintrc.js, .prettierrc.js)
npx @harsh_metrey/code-standard init --force
```

---

### 🖐️ Option 2: Manual Setup

If you prefer to configure your repository manually without the CLI:

#### 1. Install Package & Peer Dependencies

```bash
npm install --save-dev @harsh_metrey/code-standard eslint prettier typescript
```

#### 2. Configure `.eslintrc.js`

Choose the preset matching your codebase environment:

##### 🌐 React Web / Next.js Application:
```javascript
module.exports = {
  extends: ['@harsh_metrey/code-standard/react'],
  root: true,
};
```

##### 📱 React Native / Expo Application:
```javascript
module.exports = {
  extends: ['@harsh_metrey/code-standard/react-native'],
  root: true,
};
```

##### 📦 Node.js / TypeScript Package:
```javascript
module.exports = {
  extends: ['@harsh_metrey/code-standard'],
  root: true,
};
```

#### 3. Configure `.prettierrc.js`

```javascript
module.exports = require('@harsh_metrey/code-standard/prettier');
```

---

## 🎨 How Import Sorting Works

Imports are automatically sorted into clean logical groups on save:

```typescript
// 1. Side effect imports
import './global.css';

// 2. Third-party & React imports
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 3. Organizational & Design System packages
import { Button, Modal } from '@my-org/design-system';

// 4. Absolute path aliases (@/...)
import { useAuth } from '@/hooks/useAuth';

// 5. Relative local imports
import { formatCurrency } from './utils';

// 6. Stylesheet imports
import styles from './Component.module.css';
```

---

## 🔬 Custom AST Rule: `require-design-system-imports`

To prevent design system fragmentation and enforce brand design token usage, `@harsh_metrey/code-standard` includes a custom AST ESLint rule that parses your code syntax tree during linting.

### Rule Logic & AST Traversal

The rule inspects two primary AST nodes:

1. **`JSXOpeningElement`**:
   - Traverses JSX elements looking for primitive HTML tags (e.g. `<button>`, `<input>`, `<select>`, `<textarea>`, `<a>`).
   - **Lint Error**: `Direct usage of primitive HTML tag "<button>" violates organizational design system standards. Import the equivalent component from "@my-org/design-system" instead.`

2. **`ImportDeclaration`**:
   - Inspects imports from `'react-native'`.
   - Flags primitive component specifiers (e.g. `Text`, `View`, `TouchableOpacity`, `Pressable`, `Button`, `TextInput`, `ScrollView`).
   - **Lint Error**: `Direct import of primitive component "Text" from "react-native" violates architectural boundaries. Import "Text" from "@my-org/design-system" instead.`

### AST Code Comparison

```tsx
// ❌ Disallowed: Triggers AST rule lint error
import { Text, View } from 'react-native';

export const SubmitButton = () => (
  <View>
    <button onClick={handleClick}>Submit</button>
  </View>
);

// ✅ Allowed: Enterprise Design System Compliance
import { Button, Text, View } from '@my-org/design-system';

export const SubmitButton = () => (
  <View>
    <Button onClick={handleClick}>
      <Text>Submit</Text>
    </Button>
  </View>
);
```

---

## ⚙️ Overriding Rules in Specific Projects

If a project requires custom rule adjustments, extend your local `.eslintrc.js`:

```javascript
module.exports = {
  extends: ['@harsh_metrey/code-standard/react'],
  root: true,
  rules: {
    // Project-specific rule override
    'no-console': 'warn',
    
    // Customize design system AST rule options if needed
    '@harsh_metrey/code-standard/require-design-system-imports': [
      'error',
      {
        designSystemPackage: '@my-org/design-system',
        forbiddenHtmlElements: ['button', 'input'],
      },
    ],
  },
};
```

---

## 💻 Running Linting & Formatting Commands

Add these scripts to your project's `package.json`:

```json
"scripts": {
  "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
  "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
  "format": "prettier --write ."
}
```

Then run:
```bash
npm run lint
npm run lint:fix
```

---

## 📁 Repository Structure

```
@harsh_metrey/code-standard/
├── bin/
│   └── setup.js                     # DevEx CLI script (npx @harsh_metrey/code-standard init)
├── rules/
│   ├── index.js                     # Local ESLint plugin rules exporter
│   └── require-design-system-imports.js # Custom AST Rule enforcing @my-org/design-system
├── tests/
│   ├── config.test.js               # Export structure audit test
│   ├── rule-ast.test.js             # Standalone AST rule test
│   └── rule.test.js                 # ESLint RuleTester integration test
├── index.js                         # Base TypeScript + Import Sort + Prettier config
├── react.js                         # React + Hooks + Accessibility config
├── react-native.js                  # React Native enforcement config
├── prettier.config.js               # Shared Enterprise Prettier config
├── package.json                     # NPM Manifest & Binary definitions
└── README.md                        # Developer Documentation
```

---

## 🌐 Governance & Maintenance

- **Lead Maintainers**: Platform Engineering / Developer Experience (DevEx) Team
- **Testing**: Run `npm test` to execute the full unit test suite and configuration audit.
- **Issues & RFCs**: Submit architectural rule proposals via standard internal RFC process.
