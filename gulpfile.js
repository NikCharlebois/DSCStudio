var gulp        = require("gulp"),
    browserify  = require("browserify"),
    source      = require("vinyl-source-stream"),
    buffer      = require("vinyl-buffer"),
    tslint      = require("gulp-tslint"),
    tsc         = require("gulp-typescript"),
    sourcemaps  = require("gulp-sourcemaps"),
    uglify      = require("gulp-uglify"),
    runSequence = require("run-sequence"),
    mocha       = require("gulp-mocha"),
    istanbul    = require("gulp-istanbul"),
    browserSync = require('browser-sync').create();

gulp.task("lint", function() {
    return gulp.src([
        "source/**/**.ts",
        "test/**/**.test.ts"
    ])
    .pipe(tslint({ }))
    .pipe(tslint.report("verbose"));
});

var tsProject = tsc.createProject("tsconfig.json");

gulp.task("build-app", function() {
    return gulp.src([
            "source/**/**.ts",
            "typings/main.d.ts/",
            "source/interfaces/interfaces.d.ts"
        ])
        .pipe(tsc(tsProject))
        .js.pipe(gulp.dest("source/"));
});

gulp.task("bundle", function() {

    // var libraryName = "athena";
    // var mainTsFilePath = "source/main.js";
    var outputFolder   = "dist/";
    // var outputFileName = libraryName + ".min.js";

    return gulp.src([
        'source/**/**.html',
        'source/electron.js'
        ])
        .pipe(gulp.dest(outputFolder));

    // var bundler = browserify({
    //     debug: true,
    //     standalone : libraryName
    // });

    // return bundler.add(mainTsFilePath)
    //     .bundle()
    //     .pipe(source(outputFileName))
    //     .pipe(buffer())ru
    //     .pipe(sourcemaps.init({ loadMaps: true }))
    //     .pipe(uglify())
    //     .pipe(sourcemaps.write('./'))
    //     .pipe(gulp.dest(outputFolder));
});
