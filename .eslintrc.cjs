module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'standard-with-typescript'
  ],
  ignorePatterns: [ 'dist', 'scripts' ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react',
    'react-refresh',
    '@typescript-eslint',
    'eslint-plugin-import'
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    '@typescript-eslint/no-unused-vars': [ 'warn' ],
    '@typescript-eslint/indent': [ 'error', 2 ],
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    'react/prop-types': 'off',
    'react/self-closing-comp': [
      'error', {
        component: true,
        html: true
      }],
    'react/jsx-first-prop-new-line': [
      1,
      'multiline'
    ],
    'array-bracket-spacing': [
      'error',
      'always',
      {
        objectsInArrays: false,
        arraysInArrays: false
      }
    ],
    'object-property-newline': [ 1 ],
    'function-call-argument-newline': [ 'error', 'always' ],
    'function-paren-newline': [ 'error', 'multiline-arguments' ],
    'react/jsx-max-props-per-line': [ 1 ],
    'react/jsx-closing-tag-location': [ 1 ],
    'react/jsx-closing-bracket-location': [ 1 ],
    'react/jsx-sort-props': [ 1 ],
    'no-multiple-empty-lines': [ 'error', { max: 1, maxEOF: 0 }],
    'no-trailing-spaces': 'error',
    'no-multi-spaces': [ 1 ],
    'react/jsx-tag-spacing': [
      2,
      {
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        closingSlash: 'never',
        beforeClosing: 'never'
      }
    ],
    'react/jsx-curly-brace-presence': [
      2,
      {
        props: 'never',
        children: 'never'
      }
    ],
    'import/order': [
      'error',
      {
        groups: [ 'builtin', 'external', 'internal' ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: [ 'react' ],
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    'object-curly-spacing': [
      1,
      'always'
    ],
    'react/jsx-curly-spacing': [
      2,
      {
        when: 'never',
        children: { when: 'always' }
      }
    ],
    'react/jsx-wrap-multilines': [
      1,
      {
        arrow: 'ignore',
        assignment: 'ignore',
        condition: 'ignore',
        declaration: 'ignore',
        logical: 'ignore',
        prop: 'ignore',
        return: 'parens-new-line'
      }
    ],
    'arrow-parens': [
      1,
      'as-needed'
    ],
    'comma-dangle': [ 'error', 'never' ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    quotes: [
      'error',
      'single'
    ],
    'jsx-quotes': [ 'error', 'prefer-single' ],
    semi: [
      'error',
      'never'
    ]
  }
}
