/* eslint-disable import/no-extraneous-dependencies, global-require, @typescript-eslint/no-var-requires */
// Node.js path helper
const path = require('path');
// Enable built-in plugins
const webpack = require('webpack');
// Combine configurations
const { merge } = require('webpack-merge');
// Base configuration
const commonConfig = require('./webpack.common');
// Package metadata
const pkg = require('../package.json');
// Resolve a path to the project root
const resolve = path.resolve.bind(path, process.cwd());

// Webpack configurations
module.exports = merge(commonConfig, {
  mode: 'development',
  devServer: {
    contentBase: resolve('test'),
  },
  // source mapping
  devtool: 'eval-cheap-module-source-map',
  // logger
  stats: {
    colors: true,
    logging: 'warn',
    modules: false,
  },
  output: {
    path: resolve('test'),
    publicPath: '/',
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(pkg.version),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'ts-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          // Inject css into DOM as <style /> node
          'style-loader',
          // Interprete CSS to commonJS
          'css-loader',
          // Vendor prefix
          'postcss-loader',
          // Compile sass to css
          'sass-loader',
        ],
      },
    ],
  },
});
