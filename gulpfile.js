var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("es6", function () {
  return gulp.src("src/*.js")
    .pipe(babel({
            presets: ['es2015']
        }))
    .pipe(gulp.dest("dist"));
});

gulp.task("es6:watch", function () {
  gulp.watch("src/*.js", ['es6']);
});

gulp.task('default', ['es6', 'es6:watch']);