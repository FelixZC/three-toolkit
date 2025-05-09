module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  ignorePatterns: ['node_modules/', 'dist/'],
  rules: {
    "prettier/prettier": "error"
  }
};
