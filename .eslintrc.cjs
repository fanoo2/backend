
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',    // TypeScript rules without type-checking
  ],
  env: {
    node: true,
    es2021: true,
  },
  ignorePatterns: ['dist/**/*', 'node_modules/**/*'],
  rules: {
    // your overrides, for example:
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
