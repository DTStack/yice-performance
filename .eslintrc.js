module.exports = {
    extends: [require.resolve('ko-lint-config/.eslintrc')],
    rules: {
        camelcase: 0,
        'no-useless-escape': 0,
        'prettier/prettier': 2,
        'react-hooks/exhaustive-deps': 0,
    },
};
