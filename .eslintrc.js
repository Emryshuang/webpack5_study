module.exports = {
    // 继承 Eslint 规则
    extends: ["eslint:recommended"],
    // presets: [
    //   [
    //     "@babel/preset-env",
    //     // 按需加载core-js的polyfill
    //     { useBuiltIns: "usage", corejs: { version: "3", proposals: true } },
    //   ],
    // ],
    parser: "@babel/eslint-parser", // 支持最新的最终 ECMAScript 标准
    env: {
        node: true, // 启用node中全局变量
        browser: true, // 启用浏览器中全局变量
    },
    parserOptions: {
        ecmaVersion: 11,
        sourceType: "module",
    },
    rules: {
        "no-var": 2, // 不能使用 var 定义变量
    },
};