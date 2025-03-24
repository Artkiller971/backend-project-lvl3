import globals from 'globals';
import stylisticJs from '@stylistic/eslint-plugin-js';
import fp from 'eslint-plugin-fp';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    languageOptions: { globals: globals.node },
    plugins: {
      '@stylistic/js': stylisticJs,
      fp,
      importPlugin,
    },
    rules: {
      semi: 'error',
      'no-shadow': 'error',
      'importPlugin/newline-after-import': 'error',
      'fp/no-mutation': 'error',
      'fp/no-mutating-methods': 'error',
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      'consistent-return': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'default-case': 'error',
      'no-else-return': 'error',
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always',
        functions: 'never',
        importAttributes: 'always',
        dynamicImports: 'always',
      }],
      '@stylistic/js/padded-blocks': ['error', { blocks: 'never' }],
      '@stylistic/js/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      '@stylistic/js/no-trailing-spaces': ['error'],
      '@stylistic/js/eol-last': ['error', 'always'],
      '@stylistic/js/no-multi-spaces': ['error'],
      '@stylistic/js/quote-props': ['error', 'as-needed'],
      '@stylistic/js/space-infix-ops': ['error'],
      '@stylistic/js/space-in-parens': ['error'],
      '@stylistic/js/object-curly-spacing': ['error', 'always'],
      '@stylistic/js/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/js/comma-spacing': ['error'],
    },
  },

];
