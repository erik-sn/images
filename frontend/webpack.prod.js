/* eslint-disable */
const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const VERSION = require('./package.json').version;
/* eslint-enable */

module.exports = {
  /**
    generate full source maps so errors/debugging
    from minified code can be related back to the
    source code
  */
  devtool: 'source-map',
  entry: [
    './src/index.tsx',
  ],
  output: {
    path: path.join(__dirname, './dist'),
    filename: `bundle.min.${VERSION}.js`,
    publicPath: '/assets/',
  },
  plugins: [
    /**
      set the production flag in the node environment
      variables. This flag tells React to disable warnings
      and generate a compressed, production ready version
      of the library

      https://facebook.github.io/react/docs/optimizing-performance.html#webpack
    */
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        DEV: JSON.stringify(false),
        // eslint-disable-next-line
        VERSION: JSON.stringify(require('./package.json').version),
      },
    }),
    /**
      After the scss/css is processed and bundle generated
      move it to the webpack output directory
    */
    new ExtractTextPlugin({
      filename: `bundle.min.${VERSION}.css`,
      allChunks: true,
    }),
    /**
      Process the output css file - minify, remove comments,
      remove duplicate code
      */
    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: { discardComments: { removeAll: true } },
    }),
    /**
      UglifyJS handles minification, obfuscation and code
      clean up (removing unused code, removing console
      statements, etc.) for JavaScript.

      https://github.com/webpack-contrib/uglifyjs-webpack-plugin
      */
    new webpack.optimize.UglifyJsPlugin({
      // options to compress JS code
      // https://github.com/mishoo/UglifyJS2/tree/harmony#compress-options
      compress: {
        warnings: false,
        drop_console: true, // remove all console.* statements
      },
      // enable source maps for the uglified version of the
      // javascript files
      sourceMap: {
        filename: `bundle.min.${VERSION}.js`,
        url: `bundle.min.${VERSION}.js.map`,
      },
      // parallelize the build process to speed up
      parallel: true,
    }),
    /**
      inject the compiled css/js files into the
      index.html file to be served to the user
      */
    new HtmlWebpackPlugin({
      template: 'dist/index.html',
    }),
    /**
      display the resulting js bundle with a visualization
      chart in a web browser. This is for checking the size
      of the bundle. Browse to file:///srv/mip/assets/report.html
      in a web browser.
      */
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
  ],
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'ts-loader', 
            options: {
              configFile: 'tsconfig.prod.json',
            }
          }
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
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader'],
        }),
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader'],
        }),
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
