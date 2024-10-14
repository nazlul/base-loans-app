const { nextLint } = require('eslint-config-next');

/** @type {import('eslint').Linter.Config} */
const config = [
    nextLint(),
    {
        files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
        rules: {
        },
    },
];

module.exports = config;
