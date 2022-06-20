const path = require('path')
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const htmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: './src/main.js',
    output: {
        // path: path.resolve(__dirname,'../dist'),
        path: undefined,
        filename: 'static/js/main.js',
        // clean: true
    },
    module: {
        rules: [{
            oneOf: [

                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.less$/,
                    use: ["style-loader", 'css-loader', 'less-loader']
                },
                {
                    test: /\.styl$/,
                    use: ["style-loader", 'css-loader', 'stylus-loader']
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // 将 JS 字符串生成为 style 节点
                        'style-loader',
                        // 将 CSS 转化成 CommonJS 模块
                        'css-loader',
                        // 将 Sass 编译成 CSS
                        'sass-loader',
                    ]
                },
                {
                    test: /\.(png|jpe?g|gif|webp)$/,
                    type: "asset",
                    parser: {
                        dataUrlCondition: {
                            maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
                        },
                    },
                    generator: {
                        // 将图片文件输出到 static/imgs 目录中
                        // 将图片文件命名 [hash:8][ext][query]
                        // [hash:8]: hash值取8位
                        // [ext]: 使用之前的文件扩展名
                        // [query]: 添加之前的query参数
                        filename: "static/imgs/[hash:8][ext][query]",
                    },
                },
                {
                    test: /\.js$/,
                    include: path.resolve(__dirname, 'src'),
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true, // 开启babel编译缓存
                        cacheCompression: false, // 缓存文件不要压缩
                    },
                }
            ]
        }],
    },
    plugins: [
        new ESLintWebpackPlugin({
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules",
            cache: true,
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache")
        }),
        new htmlWebpackPlugin({ template: path.resolve(__dirname, "../public/index.html") }),
    ],
    devServer: {
        host: "localhost", // 启动服务器域名
        port: "3000", // 启动服务器端口号
        open: true, // 
        hot: true
    },
    mode: 'development',
    devtool: "cheap-module-source-map"
}