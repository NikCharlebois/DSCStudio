var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
 
gulp.task("uglifyjs", function() {
    gulp.src('src/scripts/*.js')
        .pipe(rename(function (path) {
            path.basename += ".min";
          }))
        //.pipe(uglify()) commented out while debugging
        .pipe(gulp.dest('modules/DscStudio/engine/scripts'));        
});

gulp.task("publishSyntaxHighlighter-js", function() {
    return gulp.src('src/syntaxhighlighter/*.js')
               .pipe(gulp.dest('modules/DscStudio/engine/scripts'));
});

gulp.task("publishSyntaxHighlighter-css", function() {
    return gulp.src('src/syntaxhighlighter/*.css')
               .pipe(gulp.dest('modules/DscStudio/engine/css'));
});

gulp.task("publishSyntaxHighlighter", ["publishSyntaxHighlighter-js", "publishSyntaxHighlighter-css"], function() {});

