module.exports = {
    files: ['**/*.css', '**/*.scss'],
    customSyntax: require.resolve('postcss-scss'),
    extends: 'stylelint-config-standard',
    plugins: ['stylelint-order', 'stylelint-scss'],
    rules: {
        // null 为关闭规则
        indentation: 4, // 缩进4格
        'at-rule-no-unknown': null, // 允许未知规则
        'declaration-empty-line-before': 'never', // 第一条属性声明前不允许有空行
        'selector-class-pattern': '[a-zA-Z]+', // className 的大小写
        // 规则之前的空行
        'rule-empty-line-before': [
            'always',
            {
                except: ['inside-block', 'first-nested', 'after-single-line-comment'],
            },
        ],
        'alpha-value-notation': 'number', // 小数显示数字(number)或百分数(percentage)
        'color-function-notation': 'legacy', // 颜色 rgba 等使用传统逗号隔开
        'color-hex-case': 'upper', // 颜色十六进制字符大写
        'selector-list-comma-newline-after': 'always-multi-line',
        'max-line-length': [
            300,
            {
                ignore: ['non-comments'],
            },
        ],
        'font-family-no-missing-generic-family-keyword': null, // 是否必须包含通用字体
        'no-descending-specificity': null, // 选择器顺序
        'keyframes-name-pattern': null, // keyframes 推荐小写+连字符命名
        'no-empty-source': null, // 空文件
        'block-no-empty': null, // 空规则
        'function-url-quotes': null, // url 不需要引号
        'function-no-unknown': null, // 未知方法名
        'selector-id-pattern': null, // id 使用连字符和小写字母
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global'],
            },
        ],
        'selector-no-vendor-prefix': [
            true,
            {
                ignoreSelectors: ['::-webkit-input-placeholder'],
            },
        ],
        'at-rule-name-case': null, // less 中变量名的大小写
        'selector-no-vendor-prefix': null, // 兼容写法
        'property-no-vendor-prefix': null, // 兼容写法
        'selector-pseudo-class-no-unknown': null, // 兼容写法
        'selector-type-no-unknown': null, // 兼容写法
        'number-max-precision': 10, // 数字中允许的小数位数
        'value-no-vendor-prefix': null,
    },
};
