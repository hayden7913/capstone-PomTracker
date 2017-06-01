var path = require("path");

var DIST_DIR   = path.join(__dirname, "dist"); 
var CLIENT_DIR = path.join(__dirname, "public", "scripts");


module.exports = {
    context: CLIENT_DIR,
    entry: "./app.js",
    output: {
        path: DIST_DIR ,
        filename: "bundle.js"
    },
    
    resolve: {
      extensions: ['.js']
    },
    
    module: {
      loaders: [ 
      { 
        test   : /.js$/,
        loader : 'babel-loader',
        include: __dirname + '/src',
      },
      {
        test: /\.css/,
        loaders: ['style-loader', 'css-loader'],
        include: __dirname + '/src'
      }
    ],
  }
};