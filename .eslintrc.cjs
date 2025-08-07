module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
  ],
  env: {
    node: true,
    es2021: true,
  },
  ignorePatterns: ['dist/**/*', 'node_modules/**/*', '**/*.ts'],
  rules: {
    'no-unused-vars': 'warn',
  },
};