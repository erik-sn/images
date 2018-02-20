/* eslint-disable */
const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    // enable react hot loading
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://0.0.0.0:3000',
    // only reload on successful updates
    'webpack/hot/only-dev-server',
    './src/index.tsx',
  ],
  output: {
    path: '/srv/mip/assets',
    filename: 'bundle.js',
    publicPath: '/assets',
  },
  devServer: {
    inline: true,
    // enable hot reloading for webpack-dev-server
    hot: true,
    contentBase: './src',
    port: 3000,
    disableHostCheck: true,
    historyApiFallback: true,
  },
  plugins: [
    // enable hot module replacement support in webpack
    new webpack.HotModuleReplacementPlugin(),
    // when modules are hot reloaded log them to the console
    // for developer convenience
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        BROWSER: JSON.stringify(true),
        DEV: JSON.stringify(true),
        VERSION: JSON.stringify(require('./package.json').version),
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: ['react-hot-loader/babel'],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        include: [
          path.resolve(__dirname, 'src'),
        ],
      },
      {
        test: /\.json$/,
        exclude: /(node_modules)/,
        loader: 'json-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]',
        },
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'file-loader?name=img/[name].[ext]',
      },
    ],
  },
  resolve: {
    extensions: ['*', '.json', '.', '.js', '.jsx', '.ts', '.tsx'],
    alias: { '@': path.resolve(__dirname, 'src') }
  },
};
