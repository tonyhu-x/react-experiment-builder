import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import stylistic from '@stylistic/eslint-plugin';

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  reactRecommended,
  stylistic.configs.customize({ semi: true }),
  {
    languageOptions: { globals: globals.browser },
  },
];
