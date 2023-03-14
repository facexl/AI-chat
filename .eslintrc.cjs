
module.exports ={
  parser:'vue-eslint-parser',
  parserOptions: {
    parser:'@typescript-eslint/parser'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:vue/vue3-recommended',
  ],
  rules: {
    // 'indent': ['error', 2, { SwitchCase: 1 }],
    'vue/multi-word-component-names':'off',
    "indent": ["error", 2, {
      "ignoredNodes": ["TemplateLiteral"]
    }],
    'vue/require-default-prop':'off',
    'vue/prop-name-casing':'off',
    'vue/v-on-event-hyphenation':'off',
    'padding-line-between-statements':[ "error", { "blankLine": "always", "prev": "*", "next": "*" } ]
  },
};