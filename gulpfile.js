var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("es8", function () {
  return gulp.src("src/*.js")
    .pipe(babel({
            presets: ['es2017']
        }))
    .pipe(gulp.dest("dist"));
});

gulp.task("es8:watch", function () {
  gulp.watch("src/*.js", ['es8']);
});

gulp.task('default', ['es8', 'es8:watch']);