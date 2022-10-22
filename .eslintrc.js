module.exports = {
  root: true,
  extends: ['airbnb-typescript/base', 'prettier', 'plugin:security/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'deprecation', 'security'],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'import/prefer-default-export': 'off',
    'no-nested-ternary': 'off',
    'max-classes-per-file': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    'lines-between-class-members': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'prefer-arrow-callback': 'off',
    'deprecation/deprecation': 'warn',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
        json: 'always',
      },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase', 'snake_case', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
  ignorePatterns: ['dist', 'coverage', '.eslintrc.js', 'conventional-changelog.config.js'],
};
