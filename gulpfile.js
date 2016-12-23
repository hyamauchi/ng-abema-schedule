'use strict'; // 厳格にエラーチェックを行うモードへ切替

const gulp = require('gulp'); // gulp コマンドの準備
const sass = require('gulp-sass'); // gulp-sass 

const SCSS_SRC = './src/sass/**/*.scss'; // scss ファイルの場所
const CSS_DEST = './app/css/'; // 出力場所

// scss をコンパイルするタスク
gulp.task('build:scss', function() { // build:scss というタスクを登録
  gulp.src(SCSS_SRC) // コンパイルする scss の場所
    .pipe(sass()) // gulp-sass で変換
    .pipe(gulp.dest(CSS_DEST)); // コンパイルした scss を指定場所に出力
});

// scss の変更を監視するタスク
gulp.task('scss:watch', function() { // build:scss というタスクを登録
  gulp.watch(SCSS_SRC, ['build:scss']); // 指定場所のファイルに変更があった場合、コンパイルするタスクを実行する
});

// gulp のデフォルトタスクとして scss:watch タスクを指定
gulp.task('default', ['scss:watch']);
