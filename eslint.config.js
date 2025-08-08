export default [
  {
    ignores: ['dist', 'node_modules']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: 'readonly'
      }
    },
    rules: {}
  }
];
