/*
 Gulp app builder.
 Usage: Refer https://github.com/prashanth1509/richview-gulp
 18/03/2015
 */

/*
 Dependencies
 */
var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	gulp_webpack = require('gulp-webpack'),
	$ = require('gulp-load-plugins')();

var webpack = require('webpack'),
	_ = require('lodash');

/*
 Overridable default configs through commandline
 */
var config = {
	appname: 'all',
	appdir: 'apps/**',
	cssdir: 'apps/', //Why 'apps/' instead of 'apps/**'? -> We're feeding this to sass() and not gulp.src()
	jsdir: 'apps/**/*.js',
	skeleton: 'generators/app-skeleton'
};

/*
 Output directories
 */
var build_dir = {
	css: '/Users/prashanth.a/me/php-apps/tmp/build/',
	js: '/Users/prashanth.a/me/php-apps/tmp/build/'
}

//Will hold commandline options
var options = {};

gulp.task('default', function(){
	var args = process.argv;

	//parse commandline arguments
	_.each(args,function(value, index){
		if(value.substr(0,2)=='--'){
			var mixedKeyValue = value.replace('--', '').split('=');
			options[mixedKeyValue[0]]=mixedKeyValue[1];
		}
	});

	//prepare configurations
	gulp.start('_configure');
});

gulp.task('_configure', function(){
	if(options.appdir && options.appdir.trim().length){
		var appdir = options.appdir;
		options.appname = options.appname?options.appname:appdir;
		options.cssdir = 'apps/' + appdir + '/';
		options.jsdir = 'apps/' + appdir + '/components/**/';
		options.appdir = 'apps/' + appdir + '/**';
	}
	_.assign(config, options);
	//console.log('\nUSING CONFIGURATION: ', JSON.stringify(config), '\n');

	//start watching for changes within app
	gulp.start('watch');
});

/*
 Builds scss into css and puts into build/css
 */
gulp.task('css-build', function() {

	console.log('\nCOMPILING CSS: gulp.src/sass=', config.cssdir, ' gulp.dest=', config.appname);

	//to generate file with version code
	var versionedFilename = config.appname + '-v' + (new Date().getDate()) + '.css';
	//to generate same file with prefix -lastest
	var latestFilename = config.appname + '-latest.css';


	return sass( config.cssdir, { style: 'expanded' })
		//.pipe(minify()) //uncomment and initialize at top, for minification.
		//concat all files
		.pipe(concat(versionedFilename))
		//save it
		.pipe(gulp.dest(build_dir.css))
		//rename it
		.pipe($.rename(latestFilename))
		//save it again!
		.pipe(gulp.dest(build_dir.css));

});

/*
 Builds js files with src/js to build/js
 */
gulp.task('js-build', function(){

	console.log('\nCOMPILING JS: gulp.src=', config.jsdir, ' gulp.dest=', config.appname);

	var versionedFilename = config.appname + '-v' + (new Date().getDate()) + '.js';
	var latestFilename = config.appname + '-latest.js';

	var package_config = require('./package.json')
	//Realize the shared components in package.json
	sharedDependencies = package_config.sharedDependencies?package_config.sharedDependencies:[];

	return gulp_webpack(
		{
			entry: {
				app: './apps/' + config.appname + '/entry.js'
			},
			output: {
				filename: versionedFilename
			},

			module: {
				loaders: [
					{
						//tell webpack to use jsx-loader for all *.jsx files
						test: /\.js$/,
						loader: 'jsx-loader?insertPragma=React.DOM&harmony'
					}
				]
			},
			externals: {
				//don't bundle the 'react' npm package with our bundle.js
				//but get it from a global 'React' variable
				'react': 'React'
			},
			resolve: {
				extensions: ['', '.js', '.jsx']
			}

		}
	)
		.pipe(gulp.dest(build_dir.js))
		//save another copy with -latest prefix
		.pipe($.rename(latestFilename))
		.pipe(gulp.dest(build_dir.js));

});

/*
 Watches for changes in file
 */
gulp.task('watch', function() {

	var watchPath = config.appdir;

	var fs = require('fs');
	var dir = 'apps/' + config.appname;

	//if app doesn't exist create one.
	//--todo ask user for confirmation
	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
		//create app skeleton within app directory.
		var ncp = require('ncp').ncp;
		ncp.limit = 16;
		ncp(config.skeleton, dir, function (err) {
			if(err)
				console.log('Cannot create skeleton directory please create one and try again.');
			else{
				console.log('App bare-bone generated successfully. See: ' + dir);
				//Start watching for css/js changes
				startWatch();
			}
		});

	}
	else{
		//Start watching for css/js changes
		startWatch();
	}

	function startWatch(){

		console.log('\nWATCHING: ', watchPath, '\n');

		return gulp.watch(watchPath, ['js-build', 'css-build']);
		return gulp.start(['js-build','css-build']);
	}


});
