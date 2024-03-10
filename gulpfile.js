const { src, dest, parallel, series } = require("gulp");
const through2 = require("through2");

const ignore = [
  "gulpfile*",
  "*.md",
  ".gitignore",
  "build/**",
  "node_modules/**",
  "package.json",
  "pnpm-lock.yaml",
];

function javascript(cb) {
  const { transform } = require("esbuild");
  return (
    src(["*/**.js", "./**.js"], { ignore })
      // Instead of using gulp-uglify, you can create an inline plugin
      .pipe(
        through2.obj(function (file, _, cb) {
          if (file.isBuffer()) {
            const code = transform(file.contents.toString(), {
              loader: "js",
              minify: true,
              logLevel: "warning",
            })
              .then((result) => {
                file.contents = Buffer.from(result.code);
                cb(null, file);
              })
              .catch(function (err) {
                console.error(err);
              });
          }
        })
      )
      .pipe(dest("build/"))
  );
}

function css(cb) {
  const { transform } = require("esbuild");
  return (
    src(["*/**.css", "./**.css"], { ignore })
      // Instead of using gulp-uglify, you can create an inline plugin
      .pipe(
        through2.obj(function (file, _, cb) {
          if (file.isBuffer()) {
            const code = transform(file.contents.toString(), {
              loader: "css",
              minify: true,
              logLevel: "warning",
            })
              .then((result) => {
                file.contents = Buffer.from(result.code);
                cb(null, file);
              })
              .catch(function (err) {
                console.error(err);
              });
          }
        })
      )
      .pipe(dest("build/"))
  );
}

function html(cb) {
  const htmlnano = require("htmlnano");
  return src(["**.html"], { ignore })
    .pipe(
      through2.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          htmlnano
            .process(
              file.contents.toString(),
              { removeComments: true },
              htmlnano.presets.max
            )
            .then(function (result) {
              file.contents = Buffer.from(result.html);
              cb(null, file);
            })
            .catch(function (err) {
              console.error(err);
            });
        }
      })
    )
    .pipe(dest("build/"));
}
function all(cb) {
  return src(["*/**", "./**"], { ignore }).pipe(dest("build/"));
}
const build = series(all, parallel(html, javascript, css));
exports.build = build;
// exports.default = build;
