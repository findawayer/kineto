/* eslint-disable import/no-extraneous-dependencies, global-require, @typescript-eslint/no-var-requires */
// Node.js path helper
const path = require('path');
// Package metadata
const pkg = require('../package.json');
// Resolve a path to the project root
const resolve = path.resolve.bind(path, process.cwd());

// Webpack configurations
module.exports = {
  entry: resolve(pkg.main),
  output: {
    library: 'Kineto', // Expose to global.Kineto
    libraryExport: 'default', // Use default export of the entry file
    libraryTarget: 'window', // Expose to window
    filename: `${pkg.name}.js`,
    path: resolve('dist'),
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: ['node_modules', resolve('src')],
  },
};
