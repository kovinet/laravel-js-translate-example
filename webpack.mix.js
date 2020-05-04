const mix = require('laravel-mix');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
//require('laravel-mix-bundle-analyzer');
/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

/*
if (!mix.inProduction()) {
    mix.bundleAnalyzer();
}
 */

if (mix.inProduction()) {
    mix.version();
}

mix
    .setPublicPath(path.normalize('public/app'))
    .js('resources/js/app.js', 'js/')
    .sass('resources/sass/app.scss', 'css/')
    .options({
        processCssUrls: false
    })
    .extract()
    //.version()
    .webpackConfig({
        plugins: [
            new MomentLocalesPlugin({
                localesToKeep: ['de'],
            }),
        ]
    });
