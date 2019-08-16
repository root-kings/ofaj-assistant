const { src, dest, series, watch, parallel } = require('gulp')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const replace = require('gulp-replace')
const minifyCSS = require('gulp-csso')
var del = require('del')

function clean() {
	return del(['public/build', 'build'])
}

function cleanMobile() {
	return del(['public/build'])
}

function mobilestatic() {
	src('src/config.xml').pipe(dest('build'))
	return src('public/**/*')
		.pipe(replace(/url\(\/fonts/g, 'url(../../fonts'))
		.pipe(replace(/href = '\//g, "href = 'file:///android_asset/www/"))
		.pipe(dest('build/www/'))
}

function mobilehtml() {
	return src('views/*.pug')
		.pipe(
			pug({
				pretty: true
			})
		)
		// .pipe(replace(/action="\//g, 'action="https://root-maintenance-manager.herokuapp.com/'))
		.pipe(replace(/action="\//g, 'action="https://59.99.238.23:3000/'))
		.pipe(replace(/href="\/"/g, 'href="/index.html"'))
		.pipe(replace(/href="\/calibration"/g, 'href="/calibration.html"'))
		.pipe(replace(/href="\/spares"/g, 'href="/spares.html"'))
		.pipe(replace(/href="\/about"/g, 'href="/about.html"'))
		.pipe(replace(/href="\/users"/g, 'href="/users.html"'))
		.pipe(replace(/href="\/documents"/g, 'href="/documents.html"'))
		.pipe(replace(/href="\/login"/g, 'href="/login.html"'))
		.pipe(replace(/href="\/register"/g, 'href="/register.html"'))
		.pipe(replace(/"\//g, '"'))
		.pipe(dest('build/www'))
}

function mobilecss() {
	return src('src/scss/*.scss')
		.pipe(sass())
		.pipe(minifyCSS())
		.pipe(dest('build/www/css'))
}

// function devhtml() {
// 	watch('views', parallel(html))
// }

function css() {
	return src('src/scss/*.scss')
		.pipe(sass())
		.pipe(minifyCSS())
		.pipe(dest('public/build/css'))
}

function dev() {
	watch('src/scss', parallel(css))
}

exports.clean = clean
exports.mobile = series(cleanMobile, parallel(mobilecss, mobilehtml, mobilestatic))
// exports.devhtml = devhtml
// exports.default = series(clean, html)
exports.devCss = parallel(css)
exports.default = parallel(dev)
