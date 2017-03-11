var webpack = require('webpack')
var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  entry: './app.js',
  devtool: 'source-map',
  output: {
    filename: '[name].js?[hash]',
    path: path.join(__dirname, 'public'),
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style!css',
      },
      {
        test: /\.(png|gif|jpg|jpeg|woff)$/,
        loader: 'url',
      },
      {
        test: /\.(eot|ttf|svg|ico)$/,
        loader: 'file',
      },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ],
}
