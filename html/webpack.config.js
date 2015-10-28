var path = require('path');
var webpack = require('webpack');
var CleanPlugin = require('clean-webpack-plugin');
var HtmlPlugin = require('html-webpack-plugin');
var ExtractPlugin = require('extract-text-webpack-plugin');

var production = process.env.NODE_ENV === 'production';

var plugins = [
    new HtmlPlugin({
        inject: true,
        template: './index.html'
    }),
    new ExtractPlugin('bundle.css'),
    new webpack.optimize.CommonsChunkPlugin({
        name:      'main', // Move dependencies to our main file
        children:  true, // Look for common dependencies in all children,
        minChunks: 2 // How many times a dependency must come up before being extracted
    })
];

if (production) {
    plugins = plugins.concat([
        new CleanPlugin('dist'),
        // This plugin looks for similar chunks and files
        // and merges them for better caching by the user
        new webpack.optimize.DedupePlugin(),

        // This plugins optimizes chunks and modules by
        // how much they are used in your app
        new webpack.optimize.OccurenceOrderPlugin(),

        // This plugin prevents Webpack from creating chunks
        // that would be too small to be worth loading separately
        new webpack.optimize.MinChunkSizePlugin({
            minChunkSize: 10000
        }),

        // This plugin minifies all the Javascript code of the final bundle
        new webpack.optimize.UglifyJsPlugin(
            {
                mangle:   true,
                compress: {
                    warnings: false // Suppress uglification warnings
                }
            }
        ),

        // This plugins defines various variables that we can set to false
        // in production to avoid code related to them from being compiled
        // in our final bundle
        new webpack.DefinePlugin({
            __SERVER__:      !production,
            __DEVELOPMENT__: !production,
            __DEVTOOLS__:    !production,
            'process.env':   {
                BABEL_ENV: JSON.stringify(process.env.NODE_ENV),
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),
        new webpack.NoErrorsPlugin()

    ]);
}

module.exports = {
    devtool: production ? false : 'eval',
    entry: './src/index',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    plugins: plugins,
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel'],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loader: ExtractPlugin.extract('style', 'css')
            },
            {
                test: /\.(svg|ttf|otf|eot|woff|woff2)/,
                loader: 'file'
            }
        ]
    },
};