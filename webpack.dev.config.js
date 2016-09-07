/**
 * Created by Paul on 9/6/2016.
 */

module.exports = {
  entry: "./src/index.js",
  output: {
    path: "./dist",
    filename: "gun.js",
    library: 'Gun',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  // devtool: 'sourcemap',
  module: {
    loaders: [
      {
        test: /\.js/,
        exclude: /node_modules|dist|test|lib|examples/,
        loaders: ['babel', 'eslint']
      },
    ]
  },
  resolve: {
    extensions: ['', '.js'],
  },
};
