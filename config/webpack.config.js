const os = require("os");
const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");

// cpu核数
const threads = os.cpus().length;
const isProduction = process.env.NODE_ENV === "production";
// console.log('@', isProduction, process.env.NODE_ENV)
// 获取处理样式的Loaders
const getStyleLoaders = (preProcessor) => {
    return [
        isProduction ? MiniCssExtractPlugin.loader : "style-loader",
        "css-loader",
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        "postcss-preset-env", // 能解决大多数样式兼容性问题
                    ],
                },
            },
        },
        preProcessor,
    ].filter(Boolean);
};

module.exports = {
    entry: "./src/main.js",
    output: {
        path: isProduction ? path.resolve(__dirname, "../dist") : undefined,
        filename: isProduction ? "static/js/[name].[contenthash:10].js" : "static/js/[name].js",
        chunkFilename: isProduction ? "static/js/[name].[contenthash:10].chunk.js" : "static/js/[name].chunk.js",
        assetModuleFilename: "static/media/[hash:10][ext][query]",
        clean: true,
    },
    module: {
        rules: [{
            oneOf: [{
                    // 用来匹配 .css 结尾的文件
                    test: /\.css$/,
                    // use 数组里面 Loader 执行顺序是从右到左
                    use: getStyleLoaders(),
                },
                {
                    test: /\.less$/,
                    use: getStyleLoaders("less-loader"),
                },
                {
                    test: /\.s[ac]ss$/,
                    use: getStyleLoaders("sass-loader"),
                },
                {
                    test: /\.styl$/,
                    use: getStyleLoaders("stylus-loader"),
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
                    test: /\.(ttf|woff2?)$/,
                    type: "asset/resource",
                    generator: {
                        filename: "static/media/[hash:8][ext][query]",
                    },
                },
                {
                    test: /\.js$/,
                    // exclude: /node_modules/, // 排除node_modules代码不编译
                    include: path.resolve(__dirname, "../src"), // 也可以用包含
                    use: [{
                            loader: "thread-loader", // 开启多进程
                            options: {
                                workers: threads, // 数量
                            },
                        },
                        {
                            loader: "babel-loader",
                            options: {
                                cacheDirectory: true, // 开启babel编译缓存
                                cacheCompression: false, // 缓存文件不要压缩
                                plugins: ["@babel/plugin-transform-runtime"], // 减少代码体积
                            },
                        },
                    ],
                },
            ],
        }, ],
    },
    plugins: [
        new ESLintWebpackPlugin({
            // 指定检查文件的根目录
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules", // 默认值
            cache: true, // 开启缓存
            // 缓存目录
            cacheLocation: path.resolve(
                __dirname,
                "../node_modules/.cache/.eslintcache"
            ),
            threads, // 开启多进程
        }),
        new HtmlWebpackPlugin({
            // 以 public/index.html 为模板创建文件
            // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
            template: path.resolve(__dirname, "../public/index.html"),
        }),
        // 提取css成单独文件
        isProduction && new MiniCssExtractPlugin({
            // 定义输出文件名和目录
            filename: "static/css/[name].css",
            chunkFilename: "static/css/[name].chunk.css",
        }),
        // css压缩
        // new CssMinimizerPlugin(),
        isProduction && new PreloadWebpackPlugin({
            rel: "preload", // preload兼容性更好
            as: "script",
            // rel: 'prefetch' // prefetch兼容性更差
        }),
        isProduction && new CopyPlugin({
            patterns: [{
                from: path.resolve(__dirname, "../public"),
                to: path.resolve(__dirname, "../dist"),
                globOptions: {
                    // 忽略index.html文件
                    ignore: ["**/index.html"],
                },
            }, ],
        }),
    ].filter(Boolean),
    optimization: {
        minimize: true,
        minimizer: [
            // css压缩也可以写到optimization.minimizer里面，效果一样的
            new CssMinimizerPlugin(),
            // 当生产模式会默认开启TerserPlugin，但是我们需要进行其他配置，就要重新写了
            new TerserPlugin({
                parallel: threads // 开启多进程
            })
        ],
        splitChunks: {
            chunks: 'all'
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}`
        }
    },
    // devServer: {
    //   host: "localhost", // 启动服务器域名
    //   port: "3000", // 启动服务器端口号
    //   open: true, // 是否自动打开浏览器
    // },
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "cheap-module-source-map",
    resolve: {
        // 自动补全文件扩展名
        extensions: [".js", ".json"],
        // 路径别名
        alias: {
            "@": path.resolve(__dirname, "../src"),
        },
    },
    devServer: {
        host: "localhost",
        port: 3000,
        open: true,
        hot: true, // 开启HMR
        historyApiFallback: true, // 解决前端路由刷新404问题
    },
    performance: false,
};