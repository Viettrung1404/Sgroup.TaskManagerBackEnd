// module.exports = {
//     env: {
//       node: true,
//       es2021: true
//     },
//     extends: [
//       "eslint:recommended",
//       "plugin:@typescript-eslint/recommended",
//       "plugin:import/recommended",
//       "plugin:import/typescript",
//       "prettier",
//     ],
//     parser: "@typescript-eslint/parser",
//     parserOptions: {
//       ecmaVersion: "latest",
//       sourceType: "module"
//     },
//     plugins: ["@typescript-eslint", "import", "prettier"],
//     rules: {
//       "no-unused-vars": "off",
//       "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
//       "import/no-unresolved": "error",
//       "import/order": [
//         "warn",
//         {
//           "groups": [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
//           "alphabetize": { "order": "asc", "caseInsensitive": true }
//         }
//       ]
//     },
//     settings: {
//       "import/resolver": {
//         typescript: {}
//       }
//     }
//   };