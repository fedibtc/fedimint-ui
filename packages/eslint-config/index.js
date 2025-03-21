module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'turbo',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: true },
    ],
    semi: ['error', 'always', { omitLastInOneLineBlock: true }],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@chakra-ui/react',
            importNames: ['HStack', 'VStack'],
            message:
              "Please use <Flex direction='row|column'> instead as it does not add any additional styling, where as HStack/VStack components add 0.5 rem margin to their children, leading to inconsistent styling.",
          },
          {
            name: '@chakra-ui/react',
            importNames: ['useTheme'],
            message: 'Please import useTheme from @fedimint/ui instead.',
          },
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
