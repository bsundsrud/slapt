var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require("webpack");
var del = require("del");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./webpack.config.js");

gulp.task("default", ["webpack-dev-server"]);

gulp.task("build", ["webpack:build"]);

gulp.task("build-dev", ["webpack:build-dev"]);

gulp.task("static", function() {
    return gulp.src("./static/**", {base: './static'})
        .pipe(gulp.dest('./build/'));
});

gulp.task("clean", function() {
    return del('build/');
});

gulp.task("webpack:build", ['static'], function(callback) {
// modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.entry.app = './src/app.js';
    myConfig.plugins = myConfig.plugins.concat(
        new webpack.DefinePlugin({
            "process.env": {
// This has effect on the react lib size
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    );
// run webpack
    webpack(myConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build", err);
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        callback();
    });
});

var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = "source-map";
myDevConfig.debug = true;
// create a single instance of the compiler to allow caching
var devCompiler = webpack(myDevConfig);

gulp.task("webpack:build-dev", ['static'], function(callback) {
    // run webpack
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-dev", err);
        gutil.log("[webpack:build-dev]", stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task("webpack-dev-server", ['static'], function(callback) {
// modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.debug = true;
    myConfig.plugins = myConfig.plugins.concat(
        new webpack.HotModuleReplacementPlugin()
    );
// Start a webpack-dev-server
    new WebpackDevServer(webpack(myConfig), {
        stats: {
            colors: true
        },
        contentBase: 'build',
        proxy: {
            "/api/*": "http://localhost:8080"
        }
    }).listen(8081, "localhost", function(err) {
            if(err) throw new gutil.PluginError("webpack-dev-server", err);
            gutil.log("[webpack-dev-server]", "http://localhost:8081/webpack-dev-server/index.html");
        });
});