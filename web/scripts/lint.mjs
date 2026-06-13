import { ESLint } from 'eslint';
import nextPlugin from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const fix = process.argv.includes('--fix');

const eslint = new ESLint({
  cwd: process.cwd(),
  fix,
  useEslintrc: false,
  ignore: true,
  baseConfig: {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: 'latest',
      sourceType: 'module',
      warnOnUnsupportedTypeScriptVersion: false,
    },
    plugins: ['@next/next', '@typescript-eslint', 'import', 'prettier', 'react', 'react-hooks', 'simple-import-sort'],
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', ignoreRestSiblings: true, varsIgnorePattern: '^_' },
      ],
      'prettier/prettier': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'warn',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-named-as-default': 'error',
      'import/no-unresolved': 'warn',
      'react/self-closing-comp': 'warn',
      'react/display-name': 'off',
    },
  },
  plugins: {
    '@next/next': nextPlugin,
    '@typescript-eslint': tsEslintPlugin,
    import: importPlugin,
    prettier: prettierPlugin,
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
    'simple-import-sort': simpleImportSortPlugin,
  },
});

const results = await eslint.lintFiles(['app/**/*.{js,jsx,ts,tsx}', 'src/**/*.{js,jsx,ts,tsx}']);

if (fix) {
  await ESLint.outputFixes(results);
}

const errorLines = [];
for (const result of results) {
  for (const message of result.messages) {
    if (message.severity !== 2) continue;
    errorLines.push(
      `${result.filePath}:${message.line ?? 0}:${message.column ?? 0} ${message.ruleId ?? 'unknown'} ${message.message}`
    );
  }
}

if (errorLines.length > 0) {
  console.log(errorLines.join('\n'));
}

const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
if (errorCount > 0) {
  process.exitCode = 1;
}
