const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    app: path.resolve(__dirname, "src/scripts/index.js"),
    restaurantDetails: path.resolve(
      __dirname,
      "src/scripts/restaurant-details.js"
    ),
    favorites: path.resolve(__dirname, "src/scripts/favorites.js"),
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "src/templates/index.html"),
      chunks: ["app"],
    }),

    new HtmlWebpackPlugin({
      filename: "favorites.html",
      template: path.resolve(__dirname, "src/templates/favorites.html"),
      chunks: ["favorites"],
    }),

    new HtmlWebpackPlugin({
      filename: "restaurant-details.html",
      template: path.resolve(
        __dirname,
        "src/templates/restaurant-details.html"
      ),
      chunks: ["restaurantDetails"],
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/public/"),
          to: path.resolve(__dirname, "dist/"),
        },
        {
          from: path.resolve(__dirname, "src/sw.js"),
          to: path.resolve(__dirname, "dist/sw.js"),
        },
        {
          from: path.resolve(__dirname, "src/manifest.json"),
          to: path.resolve(__dirname, "dist/manifest.json"),
        },
      ],
    }),
  ],
};
