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
    favorites: path.resolve(__dirname, "src/scripts/favorites.js"), // Add favorites.js entry point
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
      chunks: ["app"], // Only include index.js in index.html
    }),

    new HtmlWebpackPlugin({
      filename: "favorites.html",
      template: path.resolve(__dirname, "src/templates/favorites.html"),
      chunks: ["favorites"], // Now correctly includes favorites.js
    }),

    new HtmlWebpackPlugin({
      filename: "restaurant-details.html",
      template: path.resolve(
        __dirname,
        "src/templates/restaurant-details.html"
      ),
      chunks: ["restaurantDetails"], // Only include restaurant-details.js in restaurant-details.html
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/public/"),
          to: path.resolve(__dirname, "dist/"),
        },
      ],
    }),
  ],
};
