const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',

  entry: './src/index.js', // your main JS file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // cleans dist folder before build
  },

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|jpg)$/i,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
          outputPath: "./assets",
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // your source HTML
      filename: 'index.html',       // output file
    }),
  ],

  devServer: {
    client:{
      overlay: false,   // disables the red error overlay
    },
    static: {
      directory: path.join(__dirname, 'dist'), // serve dist folder
    },
    devMiddleware: {
      writeToDisk: true, // ✅ important: writes files to disk
    },
    port: 8080,
    open: true, // opens browser automatically
    hot: true,  // enables hot reload
  },
};
