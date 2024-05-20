import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import stylistic from '@stylistic/eslint-plugin';
import jest from 'eslint-plugin-jest';

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  reactRecommended,
  reactJsxRuntime,
  stylistic.configs.customize({ semi: true }),
  {
    files: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ],
    ...jest.configs['flat/recommended'],
    ...jest.configs['flat/style'],
  },
  {
    languageOptions: { globals: globals.browser },
  },
];
