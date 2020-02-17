const path = require("path");

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: "development",
  //mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },

  devServer: {
    contentBase: "./dist"
  }

  /*
    plugins: [
        new BundleAnalyzerPlugin()
      ]
      */
};
