/* eslint-disable import/no-extraneous-dependencies, global-require, @typescript-eslint/no-var-requires */
// Node.js path helper
const path = require('path');
// Enable built-in plugins
const webpack = require('webpack');
// Combine configurations
const { merge } = require('webpack-merge');
// CSS extractor
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// Custom JS minifier
const TerserPlugin = require('terser-webpack-plugin');
// File manager
const FileManagerPlugin = require('filemanager-webpack-plugin');
// Base configuration
const commonConfig = require('./webpack.common');
// Package metadata
const pkg = require('../package.json');
// Resolve a path to the project root
const resolve = path.resolve.bind(path, process.cwd());

// Webpack configurations
module.exports = merge(commonConfig, {
  mode: 'production',
  output: {
    path: resolve('dist'),
  },
  plugins: [
    // Dynamically convert version string to actual version.
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(pkg.version),
    }),
    // Seperate CSS file from the bundle
    new MiniCssExtractPlugin({
      filename: `${pkg.name}.css`,
    }),
    // Copy bundled files to documentation directory
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [{ source: 'dist', destination: 'docs/assets/kineto' }],
        },
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{ loader: 'babel-loader', options: { cwd: '../' } }, 'ts-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          // Extract as separate CSS file for distribution
          MiniCssExtractPlugin.loader,
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
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.(?:t|j)s$/,
        cache: true,
        terserOptions: {
          compress: {
            // Drop all `console.debug` calls
            pure_funcs: ['console.debug'],
          },
        },
      }),
    ],
  },
});
