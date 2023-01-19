module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-restricted-properties': [
      'error',
      {
        object: 'test',
        property: 'only'
      },
      {
        object: 'test',
        property: 'skip'
      },
      {
        object: 'describe',
        property: 'only'
      },
      {
        object: 'describe',
        property: 'skip'
      }
    ]
  }
}
