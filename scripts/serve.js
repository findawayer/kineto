/* eslint-disable import/no-extraneous-dependencies, global-require, @typescript-eslint/no-var-requires */
const ip = require('ip');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const devConfig = require('./webpack.dev');
const {
  config: { port },
} = require('../package.json');

const compiler = webpack(devConfig);
const server = new WebpackDevServer(compiler, {
  contentBase: devConfig.devServer.contentBase,
  publicPath: devConfig.output.publicPath,
  hot: true,
  disableHostCheck: true,
  stats: {
    colors: true,
    modules: false,
  },
});

server.listen(port, '0.0.0.0', error => {
  if (error) {
    console.error(error);
    return;
  }
  // Log with colors for emphasis :)
  console.log('\x1b[36m%s\x1b[0m', `Local: http://localhost:${port}`);
  console.log('\x1b[36m%s\x1b[0m', `Remote: http://${ip.address()}:${port}`);
});
