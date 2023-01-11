module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        semi: 0,
        strict: 0,
        // 建议驼峰命名
        camelcase: [
            1,
            {
                ignoreDestructuring: true, // 忽略解构时的驼峰命名校验
            },
        ],
        eqeqeq: 0,
        'arrow-body-style': 0, // 控制箭头函数的语法形式
        'object-shorthand': 2, // 对象的 key 和 value 一致时要求简写
        'comma-dangle': [
            2,
            {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'never',
            },
        ], // 当最后一个元素或属性与结束或属性位于不同的行时，要求末尾逗号
        'space-before-function-paren': [
            // 箭头函数是否要求始终有小括号
            // 函数括号前的空格
            2,
            {
                anonymous: 'always', // 匿名函数表达式，例如 function () {}
                named: 'never', // 命名函数表达式，例如 function foo () {}
                asyncArrow: 'always', // 异步箭头函数表达式，例如 async () => {}
            },
        ],
        'one-var': 0, // 可同时定义多个变量，逗号隔开
        'no-debugger': 2,
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 0,
        '@typescript-eslint/no-var-requires': 0,
    },
};
