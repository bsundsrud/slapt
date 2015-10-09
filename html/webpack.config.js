var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

var node_modules_dir = path.resolve(__dirname, 'node_modules');

var config = {
    entry: {
        app: ['webpack/hot/dev-server', path.resolve(__dirname, 'src/app.js')],
        vendors: ['react', 'react/addons', 'alt', 'alt/AltContainer', 'axios', 'react-popover', 'moment', 'immutable']
    },
    resolve: {
        alias: {}
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    },
    module: {
        noParse: [/moment.js/],
        loaders: [
            {test: /\.(js|jsx)$/, loaders: ['react-hot', 'babel'], exclude: [node_modules_dir]}
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(/^\.\/locale$/),
        new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(__dirname, 'src/index.html')
        }),
        new webpack.NoErrorsPlugin()
    ],
    progress: true
};


module.exports = config;