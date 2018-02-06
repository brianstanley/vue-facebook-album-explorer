const webpack = require('webpack')
const merge  = require('webpack-merge')
const path = require('path')

var commonConfig = {
  output: {
    path: path.resolve(__dirname + '/dist/'),
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: __dirname,
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.css$/,
        loader: 'style!less!css'
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      sourceMap: false,
      mangle: true,
      compress: {
        warnings: false
      }
    })
  ]
}

module.exports = [
  merge(commonConfig, {
    entry: path.resolve(__dirname + '/src/FacebookAlbumExplorer.js'),
    output: {
      filename: 'vue-facebook-album-explorer.min.js'
    }
  })
  //TODO : ADD CONFIG POR NPM ENV
]
