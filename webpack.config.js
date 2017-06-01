var path = require("path");

var CLIENT_DIR = path.join(__dirname, "public", "scripts");
var DIST_DIR   = path.join(__dirname, "dist"); 


module.exports = {
    context: CLIENT_DIR,
    entry: ["./app.js","../index.html", "../styles/main.css"],
    output: {
        path: DIST_DIR,
        publicPath: "", 
        filename: "bundle.js",
         
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
      },
      {
        test: /\.(html|css)$/,
        loader: 'file-loader?name=[name].[ext]',
      },
    ],
  }
};