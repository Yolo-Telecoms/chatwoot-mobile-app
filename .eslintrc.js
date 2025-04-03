module.exports = {
  // Extend your base config, Prettier, and import plugin rules
  extends: [
    'expo',
    'prettier',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  plugins: ['prettier', 'import'],
  rules: {
    'prettier/prettier': 'error',
  },
  // This is where you tell ESLint how to resolve TypeScript paths
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
  ],
  ignorePatterns: ['node_modules'],
};
