/*
	Gulp related deps
*/
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
	$ = require('gulp-load-plugins')();

//CHANGE NAME OF APP
var APP = "dev";

var dev_dir = {
	css: 'src/css/' + APP,
	js: 'src/js/' + APP
};

var local_build_dir_dest = '/Users/prashanth.a/me/php-apps/drisle-static/';
var build_dir = {
	//css: 'build/css/' + APP,
	//js: 'build/js/' + APP
    css: local_build_dir_dest + 'css/' + APP,
    js: local_build_dir_dest + 'js/' + APP
};

var options = {};

gulp.task('css-build', function() {

	return sass( dev_dir.css, { compass: true, style: 'expanded' })
        //.pipe(concat('build.min.css'))
        .pipe(gulp.dest(build_dir.css));

});

/*
	Builds js files with src/js to build/js
*/
gulp.task('js-build', function(){

	return gulp.src( dev_dir.js + '/**/*.js' )
        //.pipe(concat('build.min.js'))
        .pipe(gulp.dest(build_dir.js));

});

/*
	Watches for changes in file
*/
gulp.task('default', function() {

	gulp.start(['js-build','css-build']);	
	return gulp.watch('src/**/**', ['js-build', 'css-build']);

});


gulp.task('cloud-deploy', function(){

    var bitballoon = require("bitballoon");
    //console.log(process.env.ACCESSKEY, process.env.SITEID);return;
    console.log("Starting deployment to cloud..");
    bitballoon.deploy({access_token: process.env.ACCESSKEY, site_id: process.env.SITEID, dir: local_build_dir_dest}, function(err, deploy) {
        if (err) { return console.log(err); }
        console.log("New deploy is live");
    });

});
