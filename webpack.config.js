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
      rules: [{
            test: /\.scss$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "sass-loader" // compiles Sass to CSS
            }]
        }], 
      loaders: [ 
      { 
        test   : /.js$/,
        loader : 'babel-loader',
        include: __dirname + '/src',
      },
      {
        test: /\.(html|css)$/,
        loader: 'file-loader?name=[name].[ext]',
      },
      
    ],
  }
};