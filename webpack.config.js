module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "./app/[name].js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  resolve: {
    extensions: ["", ".js"]
  },
}