const path = require("path");

module.exports = {
  entry: "./src/signer/signer.model.js",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "injectedSigner.js",
    path: path.resolve(__dirname, "src/signer"),
    library: "ThredSigner",
    library: {
      name: 'ThredSigner',
      type: 'var',
    },
  },
};
