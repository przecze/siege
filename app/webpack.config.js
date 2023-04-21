const path = require('path');

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    compress: false,
    host: '0.0.0.0',
    port: 8080,
  },
};
