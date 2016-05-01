// var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    // client_react_ven: './src/vendor.js',
    client: './src/client/client.js'
  },
  output: {
    path: 'build',
    filename: '[name].js'
  },
  module: {
    loaders: [
      // NOTE: ! chains loaders

      // Code Loaders
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query:
        {
          presets: ['es2015', 'react', 'stage-2']
        }
      },

      // CSS Loaders
      // { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },

      // Image and Font Loaders
      // { test: /\.woff2?$/, loader: 'url-loader'},
      // { test: /\.ttf$/, loader: 'url-loader'},
      // { test: /\.eot$/, loader: 'url-loader'},
      // { test: /\.svg$/, loader: 'url-loader'},
      // { test: /\.png$/, loader: 'url-loader'},
      // { test: /\.jpg$/, loader: 'url-loader'}
    ]
  },

  /*
  plugins: [
    new ExtractTextPlugin('[name].css', {
      allChunks: true
    })
  ],
  */

  // NOTE: Use 'source-map' for source maps
  devtool: 'source-map',

  resolve: {
    // NOTE: These are extensions that can be omitted on require(...) calls
    extensions: ['', '.js', '.jsx', '.json']
  },

  resolveLoader: {
    alias: {
      copy: 'file-loader?name=[name].[ext]&context=./src',
    }
  },
};
