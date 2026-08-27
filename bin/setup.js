#!/usr/bin/env node

/**
 * @fileoverview DevEx Automation CLI Script for @my-org/code-standard
 * Automates project initialization, ESLint/Prettier configs, VS Code auto-save settings, and Husky/lint-staged hooks.
 * @author Staff Platform Engineer (DevEx)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ----------------------------------------------------------------------------
// Color Formatting Utilities (Zero External Dependency ANSI Styling)
// ----------------------------------------------------------------------------
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function logHeader() {
  console.log(`\n${colors.cyan}${colors.bold}====================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  🚀 @harsh_metrey/code-standard DevEx Setup CLI  ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}====================================================${colors.reset}\n`);
}

function logSuccess(msg) {
  console.log(`${colors.green}✔${colors.reset} ${colors.bold}${msg}${colors.reset}`);
}

function logInfo(msg) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`);
}

function logWarn(msg) {
  console.log(`${colors.yellow}⚠${colors.reset} ${colors.yellow}${msg}${colors.reset}`);
}

function logError(msg) {
  console.log(`${colors.red}✖ ${colors.bold}${msg}${colors.reset}`);
}

// ----------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------
function getProjectRoot() {
  return process.cwd();
}

function detectPreset(targetDir) {
  const pkgPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return 'base';
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };

    if (allDeps['react-native']) {
      return 'react-native';
    }
    if (allDeps['react']) {
      return 'react';
    }
  } catch (err) {
    logWarn('Failed to parse target package.json for preset auto-detection. Falling back to base.');
  }

  return 'base';
}

function safeWriteFile(filePath, content, force = false) {
  const relPath = path.relative(process.cwd(), filePath);
  if (fs.existsSync(filePath) && !force) {
    logWarn(`File standard '${relPath}' already exists. Skipping (use --force to overwrite).`);
    return false;
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content, 'utf8');
  logSuccess(`Created ${colors.bold}${relPath}${colors.reset}`);
  return true;
}

// ----------------------------------------------------------------------------
// Core Setup Tasks
// ----------------------------------------------------------------------------

/**
 * Task A: Create .prettierrc.js & .eslintrc.js
 */
function setupConfigFiles(targetDir, preset, force) {
  logInfo(`Configuring ESLint & Prettier for preset: ${colors.magenta}${preset}${colors.reset}`);

  // 1. .prettierrc.js
  const prettierContent = `/**
 * Prettier configuration extending enterprise standards from @harsh_metrey/code-standard.
 */
module.exports = require('@harsh_metrey/code-standard/prettier');
`;
  safeWriteFile(path.join(targetDir, '.prettierrc.js'), prettierContent, force);

  // 2. .eslintrc.js
  let extendString = '@harsh_metrey/code-standard';
  if (preset === 'react') {
    extendString = '@harsh_metrey/code-standard/react';
  } else if (preset === 'react-native') {
    extendString = '@harsh_metrey/code-standard/react-native';
  }

  const eslintContent = `/**
 * ESLint configuration extending enterprise standards from @harsh_metrey/code-standard.
 */
module.exports = {
  extends: ['${extendString}'],
  root: true,
};
`;
  safeWriteFile(path.join(targetDir, '.eslintrc.js'), eslintContent, force);
}

/**
 * Task B: Create or merge .vscode/settings.json
 */
function setupVsCodeSettings(targetDir) {
  logInfo('Automating VS Code workspace settings...');
  const vscodeDir = path.join(targetDir, '.vscode');
  const settingsPath = path.join(vscodeDir, 'settings.json');

  const defaultVsCodeSettings = {
    'editor.formatOnSave': true,
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': 'explicit',
      'source.organizeImports': 'never', // Handled by simple-import-sort in ESLint
    },
    'eslint.validate': [
      'javascript',
      'javascriptreact',
      'typescript',
      'typescriptreact',
    ],
    'prettier.requireConfig': true,
  };

  let mergedSettings = { ...defaultVsCodeSettings };

  if (fs.existsSync(settingsPath)) {
    try {
      const existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      mergedSettings = {
        ...existingSettings,
        ...defaultVsCodeSettings,
        'editor.codeActionsOnSave': {
          ...(existingSettings['editor.codeActionsOnSave'] || {}),
          ...defaultVsCodeSettings['editor.codeActionsOnSave'],
        },
      };
      logInfo('Merged standard directives into existing .vscode/settings.json');
    } catch (err) {
      logWarn('Could not parse existing .vscode/settings.json. Overwriting with standard configuration.');
    }
  }

  safeWriteFile(
    settingsPath,
    JSON.stringify(mergedSettings, null, 2) + '\n',
    true // Always update to guarantee workspace auto-fix capabilities
  );
}

/**
 * Task C: Install and configure Husky & lint-staged
 */
function setupHuskyAndLintStaged(targetDir) {
  logInfo('Configuring Git Hooks (husky & lint-staged)...');
  const pkgPath = path.join(targetDir, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    logError('No package.json found in current working directory. Skipping husky configuration.');
    return;
  }

  let pkgJson;
  try {
    pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch (err) {
    logError('Failed to parse package.json. Skipping Git Hooks automation.');
    return;
  }

  // Add prepare script for Husky initialization
  pkgJson.scripts = pkgJson.scripts || {};
  if (!pkgJson.scripts.prepare) {
    pkgJson.scripts.prepare = 'husky install';
    logSuccess('Added "prepare": "husky install" to package.json scripts');
  } else if (!pkgJson.scripts.prepare.includes('husky')) {
    pkgJson.scripts.prepare = `${pkgJson.scripts.prepare} && husky install`;
    logSuccess('Appended "husky install" to existing package.json prepare script');
  }

  // Configure lint-staged
  pkgJson['lint-staged'] = pkgJson['lint-staged'] || {};
  pkgJson['lint-staged']['*.{js,jsx,ts,tsx}'] = [
    'eslint --fix',
    'prettier --write',
  ];
  pkgJson['lint-staged']['*.{json,md,yml,yaml}'] = ['prettier --write'];

  fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n', 'utf8');
  logSuccess('Configured lint-staged rules in package.json');

  // Create .husky/pre-commit hook file
  const huskyDir = path.join(targetDir, '.husky');
  const preCommitPath = path.join(huskyDir, 'pre-commit');

  const preCommitContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
`;

  safeWriteFile(preCommitPath, preCommitContent, true);

  try {
    // Grant execution permissions on Unix systems
    fs.chmodSync(preCommitPath, 0o755);
  } catch (e) {
    // Ignore on non-Unix environments
  }
}

// ----------------------------------------------------------------------------
// CLI Execution Entry Point
// ----------------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    logHeader();
    console.log(`Usage: npx @my-org/code-standard <command> [options]\n`);
    console.log(`Commands:`);
    console.log(`  ${colors.bold}init${colors.reset}       Initialize ESLint, Prettier, VS Code auto-save, and Git hooks\n`);
    console.log(`Options:`);
    console.log(`  ${colors.bold}--preset <react|react-native|base>${colors.reset}   Manually specify preset (default: auto-detect)`);
    console.log(`  ${colors.bold}--force${colors.reset}                               Overwrite existing configuration files\n`);
    process.exit(0);
  }

  if (command !== 'init') {
    logError(`Unknown command: '${command}'. Did you mean 'npx @my-org/code-standard init'?`);
    process.exit(1);
  }

  logHeader();

  const force = args.includes('--force');
  let presetOverride = null;
  const presetIdx = args.indexOf('--preset');
  if (presetIdx !== -1 && args[presetIdx + 1]) {
    presetOverride = args[presetIdx + 1];
  }

  const projectRoot = getProjectRoot();
  const preset = presetOverride || detectPreset(projectRoot);

  logInfo(`Target directory: ${colors.bold}${projectRoot}${colors.reset}`);
  logInfo(`Selected environment preset: ${colors.magenta}${colors.bold}${preset}${colors.reset}\n`);

  try {
    setupConfigFiles(projectRoot, preset, force);
    setupVsCodeSettings(projectRoot);
    setupHuskyAndLintStaged(projectRoot);

    console.log(`\n${colors.green}${colors.bold}✨ Developer Experience setup completed successfully!${colors.reset}`);
    console.log(`${colors.cyan}Your codebase is now configured with zero-config standards, VS Code auto-fix, and pre-commit hooks.${colors.reset}\n`);
  } catch (err) {
    logError(`DevEx setup encountered an error: ${err.message}`);
    process.exit(1);
  }
}

main();
