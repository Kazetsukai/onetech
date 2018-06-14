var path = require('path')
var webpack = require('webpack')
var fs = require('fs')

var rootPath = "/";
var mod = process.env.ONETECH_MOD_NAME ? "-mod" : "";

if (process.env.NODE_ENV === 'development' && fs.existsSync(`static${mod}-dev`))
  var staticPath = `static${mod}-dev`;
else
  var staticPath = `static${mod}`;

var staticTimestamp = fs.readFileSync(staticPath + "/timestamp.txt", "utf8");
var processTimestamp = fs.readFileSync("process/timestamp.txt", "utf8");
if (staticTimestamp != processTimestamp)
  throw "First run process.js to bring static up to date";

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: rootPath + 'dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader?indentedSyntax'
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            'scss': [
              'vue-style-loader',
              'css-loader',
              'sass-loader'
            ],
            'sass': [
              'vue-style-loader',
              'css-loader',
              'sass-loader?indentedSyntax'
            ]
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    historyApiFallback: {index: "/404.html"},
    noInfo: true,
    overlay: true
  },
  performance: {
    hints: false
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        ONETECH_MOD_NAME: JSON.stringify(process.env.ONETECH_MOD_NAME),
        ONETECH_MOD_URL: JSON.stringify(process.env.ONETECH_MOD_URL),
      },
      'ROOT_PATH': JSON.stringify(rootPath),
      'STATIC_PATH': JSON.stringify(rootPath + staticPath),
    })
  ],
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
