const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: __dirname,
  entry: './src/app.js',
  output: {
    // path: path.resolve(__dirname, 'dist'),
    path: `${process.cwd()}/dist`,
    filename: 'bundle.js',
  },
  devtool: 'eval-source-map',
  devServer: {},
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/images/',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.css', '.js'],
  },
  plugins: [
    // Re-generate index.html with injected script tag.
    // The injected script tag contains a src value of the
    // filename output defined above.
    new HtmlWebpackPlugin({
      inject: 'body',
      template: './src/index.html',
      // template: path.resolve(__dirname, 'public/index.html'),
    }),
  ],
}
