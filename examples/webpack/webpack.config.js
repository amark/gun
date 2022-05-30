const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let plugins = [];

plugins.push(new HtmlWebpackPlugin({
    filename: './index.html',
    template: './src/index.html',
    inject: true,
    minify: false,
    hash: false,
    cache: false,
    showErrors: false
}));

console.log("webpack config loaded");

module.exports = {

    mode: "development",
    
    // stats: 'minimal',
    stats: 'normal',
    // stats: 'verbose',

    entry: [path.resolve(__dirname, './src/app.js')],
    
    output: {
        path: path.resolve(__dirname, './public'),
        clean: true,
        filename: './app.js'
    },
    
    plugins: plugins
};
