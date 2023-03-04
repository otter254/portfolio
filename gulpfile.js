'use strict'

const autoprefixer = require('autoprefixer')
const browserSync = require('browser-sync').create()
const cssnano = require('cssnano')
const cssDeclarationSorter = require('css-declaration-sorter')
const colors = require('colors')
const crypto = require('crypto')
const dateutils = require('date-utils')
const del = require('del')
const ejs = require('gulp-ejs')
const Fiber = require('fibers')
const figlet = require('figlet')
const fs = require('fs')
const gulp = require('gulp')
const gulpif = require('gulp-if')
const htmlmin = require('gulp-htmlmin')
const htmlbeautify = require('gulp-html-beautify')
const imagemin = require('gulp-imagemin')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const jsonlint = require('gulp-jsonlint')
const mozjpeg = require('imagemin-mozjpeg')
const mqpacker = require('css-mqpacker')
const newer = require('gulp-newer')
const notify = require('gulp-notify')
const packageImporter = require('node-sass-package-importer')
const path = require('path')
const plumber = require('gulp-plumber')
const pngquant = require('imagemin-pngquant')
const postcss = require('gulp-postcss')
const postcssEasingGradients = require('postcss-easing-gradients')
const replace = require('gulp-replace')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const sassGlob = require('gulp-sass-glob-use-forward')
const sitemap = require('gulp-sitemap')
const sizeOf = require('image-size')
const through = require('through2')
const webp = require("gulp-webp")
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const zip = require('gulp-zip')

sass.compiler = require('sass');

const { src, dest } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins();

/**
 * isExistFile
 * @param {*} file
 */
const isExistFile = file => {
  try {
    fs.statSync(file)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') return false
  }
}

// 環境設定ファイルの読み込み
const setting = isExistFile('./setting.json') ? JSON.parse(fs.readFileSync('./setting.json', 'utf8')) : ''

// サイト設定ファイルの読み込み.
const siteSetting = isExistFile('./setting-site.json') ? JSON.parse(fs.readFileSync('./setting-site.json', 'utf8')) : ''

// ejs defineファイルの読み込み.
const define = isExistFile('./define.json') ? JSON.parse(fs.readFileSync('./define.json', 'utf8')) : ''

// webpackの設定ファイルの読み込み.
const webpackConfig = require('./webpack.config')
const webpackConfigBuild = require('./webpack.production.config')

// copy settings
const staticSrc = `./src/assets/static/**/*`

// icon fonts settings
const iconfontName = 'site-icon'
const iconsFolder = '/icons'
const iconsAssets = `assets/icons`
const iconsPaths = {
  src: `./src/assets/icons-svg/*.svg`,
  srcGlob: `./src/assets/icons-check`,
  dest: `./dist/${iconsAssets}`,
  templates: `./src/assets/icons-template`,
}

// clean folders
const cleanFolder = [
  `./dist/**/*`,
  `!./dist/*.{xml,txt}`,
  `!./dist/.htaccess`,
  `./dist-production/**/*`,
  `!./dist-production/*.{xml,txt}`,
]

const clean = () => del(cleanFolder)

/**
 * jsoncFileCeck
 * @param {function} cb
 */
const jsoncFileCeck = cb => {
  if (setting && siteSetting && define) {
    gulp
      .src([setting.io.setting, setting.io.siteSetting, setting.io.define])
      .pipe(jsonlint())
      .pipe(jsonlint.reporter())

    figlet(siteSetting.publishFileName, (err, data) => {
      if (err) {
        console.dir(err)
        return
      }
      console.log(data)
    })

    console.log('---------------------------'.green)
    console.log('json file check OK! Ready..'.bold.green)
    console.log('- OK: setting.json'.cyan)
    console.log('- OK: setting-site.json'.cyan)
    console.log('---------------------------'.green)
  } else {
    console.log('------------------------------'.red)
    console.log('The json file cannot be read..'.bold.red)
    console.log('------------------------------'.red)
  }

  cb()
}

/**
 * sync
 */
const browserSyncCallbacksSettings = {
  ready: (err, bs) => {
    console.log(err)
    bs.addMiddleware('*', (req, res) => {
      res.writeHead(302, {
        location: '404.html'
      })
      res.end('Redirecting!')
    })
  }
}
setting.browsersync.callbacks = browserSyncCallbacksSettings

/**
 * sync (for SSI)
 */
const browserSyncRewriteRules = [{
  match: /<!--#include virtual="(.+?)" -->/g,
  fn: function(req, res, match, filename) {
    const filePath = path.join("./dist", filename)
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath)
    } else {
      return `${filePath} could not be found`
    }
  }
}]
setting.browsersync.rewriteRules = browserSyncRewriteRules

/**
 * sync
 */
const sync = () => browserSync.init(setting.browsersync)

/**
 * reload
 * @param {function} cb
 */
const reload = cb => {
  browserSync.reload()
  cb()
}

/**
 * cleanImg
 */
const cleanImg = () => del(setting.io.output.img + '**/*.{png,apng,jpg,gif,svg,webp,ico}')

/**
 * cleanEjs
 */
const cleanEjs = () => del(setting.io.output.html + '**/*.html')

/**
 * cleanGarbage
 */
const cleanGarbage = () => del(setting.io.output.html + '**/*{maps,.map,.DS_Store,.LICENSE,Thumbs.db}')

/**
 * scss
 */
const scss = () => {
  return gulp
    .src(setting.io.input.css + '**/*.scss', { sourcemaps: true })
    .pipe(sassGlob())
    .pipe(
      sass({ fiber: Fiber, outputStyle: 'compressed', includePaths: ['node_modules', 'assets/css'] })
        .on('error', sass.logError)
    )
    .pipe(
      postcss([
        autoprefixer({ grid: true }),
        postcssEasingGradients(),
        mqpacker(),
        cssnano({ autoprefixer: false }),
        cssDeclarationSorter({ order: 'smacss' })
      ])
    )
    .pipe(replace('?rev', `?ver=${Date.now()}`)) // キャッシュ
    .pipe(gulp.dest(setting.io.output.css, { sourcemaps: '/maps' }))
    .pipe(gulpif(browserSync.active === true, browserSync.stream()))
}

/**
 * scssProduction
 */
const scssProduction = () => {
  return gulp
    .src(setting.io.input.css + '**/*.scss')
    .pipe(sassGlob())
    .pipe(
      sass({ fiber: Fiber, outputStyle: 'compressed' })
        .on('error', sass.logError)
    )
    .pipe(
      postcss([
        autoprefixer({ grid: true }),
        postcssEasingGradients(),
        mqpacker(),
        cssnano({ autoprefixer: false }),
        cssDeclarationSorter({ order: 'smacss' })
      ])
    )
    .pipe(gulp.dest(setting.io.output.css))
    .pipe(gulpif(browserSync.active === true, browserSync.stream()))
}

/**
 * ejsCompile
 * @param {boolean} mode
 */
if (siteSetting.useSSI === true) setting.htmlminProduction.ignoreCustomComments = [/#include virtual="(.+?)"/]
const ejsCompile = (mode = false) => {
  // 乱数生成
  const revision = crypto.randomBytes(8).toString('hex')

  let url = ''
  let fullurl = ''

  if (process.env.NODE_ENV === 'production') {
    if (mode !== 'fullpath') {
      url = siteSetting.siteDomainDevelopment
      fullurl = siteSetting.siteDomainDevelopment
    } else {
      url = siteSetting.siteDomainProduction
      fullurl = siteSetting.siteDomainProduction
    }
  } else if (browserSync.active === true) {
    url = browserSync.getOption('urls').get('external') + '/'
    fullurl = browserSync.getOption('urls').get('external') + '/'
  } else {
    url = '/'
    fullurl = '/'
  }

  return gulp
    .src([setting.io.input.ejs + '**/*.ejs', '!' + setting.io.input.ejs + '**/_*.ejs', '!' + setting.io.input.ejs + 'ssi/*.ejs'])
    .pipe(
      ejs(
        {
          node_env: process.env.NODE_ENV,
          siteurl: url,
          mode: mode,
          siteSetting: siteSetting,
          define: define
        },
        {},
        { ext: '.html' }
      )
    )
    .pipe(rename({ extname: '.html' }))
    .pipe(gulpif(process.env.NODE_ENV === 'development', htmlmin(setting.htmlmin)))
    .pipe(
      gulpif(
        process.env.NODE_ENV === 'production',
        htmlmin(setting.htmlminProduction)
      )
    )
    .pipe(replace(/\.(js|css|gif|jpg|jpeg|png|apng|svg|mp4|webp)\?rev/g, '.$1?rev=' + revision))
    .pipe(htmlbeautify(setting.htmlbeautify))
    .pipe(through(
      {
        objectMode: true
      },
      (chunk, enc, cb) => {
        if (chunk.isNull()) {
          cb(null, chunk)
        } else {
          const contents = String(chunk.contents)
          let dom = new JSDOM(contents)

          const imgs = [...dom.window.document.querySelectorAll('img')]
          for (let i = 0; i < imgs.length; i = (i + 1) | 0) {
            const img = imgs[i]
            const imgSrc = img.src.replace(url, '')
            const imgSize = sizeOf('dist/' + imgSrc)
            const imgScale = typeof img.dataset.scale !== 'undefined' ? img.dataset.scale : 1

            img.height = imgSize.height / imgScale
            img.width = imgSize.width / imgScale
            img.setAttribute('decoding', 'async')
            img.setAttribute('loading', 'lazy')
          }

          const anchors = [...dom.window.document.querySelectorAll('a')]
          for (let i = 0; i < anchors.length; i = (i + 1) | 0) {
            const anchor = anchors[i]
            if (anchor.getAttribute('target') === '_blank' && !anchor.getAttribute('rel')) {
              anchor.setAttribute('rel', 'noopener noreferrer')
            }
          }

          dom = dom.serialize()
          chunk.contents = Buffer.from(dom)
        }
        cb(null, chunk)
      }))
    .pipe(gulp.dest(setting.io.output.html))
}
const ejsCompileSSI = (mode = false) => {
  // 乱数生成
  const revision = crypto.randomBytes(8).toString('hex')

  let url = ''
  let fullurl = ''

  if (process.env.NODE_ENV === 'production') {
    if (mode !== 'fullpath') {
      url = siteSetting.siteDomainDevelopment
      fullurl = siteSetting.siteDomainDevelopment
    } else {
      url = siteSetting.siteDomainProduction
      fullurl = siteSetting.siteDomainProduction
    }
  } else if (browserSync.active === true) {
    url = browserSync.getOption('urls').get('external') + '/'
    fullurl = browserSync.getOption('urls').get('external') + '/'
  } else {
    url = '/'
    fullurl = '/'
  }

  return gulp
    .src([setting.io.input.ejsSSI + 'ssi/*.ejs'])
    .pipe(
      ejs(
        {
          node_env: process.env.NODE_ENV,
          siteurl: url,
          mode: mode,
          siteSetting: siteSetting,
          define: define
        },
        {},
        { ext: '.html' }
      )
    )
    .pipe(rename({ extname: '.html' }))
    .pipe(gulpif(process.env.NODE_ENV === 'development', htmlmin(setting.htmlmin)))
    .pipe(
      gulpif(
        process.env.NODE_ENV === 'production',
        htmlmin(setting.htmlminProduction)
      )
    )
    .pipe(replace(/\.(js|css|gif|jpg|jpeg|png|apng|svg|mp4|webp)\?rev/g, '.$1?rev=' + revision))
    .pipe(htmlbeautify(setting.htmlbeautify))
    .pipe(through(
      {
        objectMode: true
      },
      (chunk, enc, cb) => {
        if (chunk.isNull()) {
          cb(null, chunk)
        } else {
          const contents = String(chunk.contents)
          let dom = new JSDOM(contents)

          const imgs = [...dom.window.document.querySelectorAll('img')]
          for (let i = 0; i < imgs.length; i = (i + 1) | 0) {
            const img = imgs[i]
            const imgSrc = img.src.replace(url, '')
            const imgSize = sizeOf('dist/' + imgSrc)
            const imgScale = typeof img.dataset.scale !== 'undefined' ? img.dataset.scale : 1

            img.height = imgSize.height / imgScale
            img.width = imgSize.width / imgScale
            img.setAttribute('decoding', 'async')
            img.setAttribute('loading', 'lazy')
          }

          const anchors = [...dom.window.document.querySelectorAll('a')]
          for (let i = 0; i < anchors.length; i = (i + 1) | 0) {
            const anchor = anchors[i]
            if (anchor.getAttribute('target') === '_blank' && !anchor.getAttribute('rel')) {
              anchor.setAttribute('rel', 'noopener noreferrer')
            }
          }

          dom = dom.serialize()
          chunk.contents = Buffer.from(dom)
        }
        cb(null, chunk)
      }))
    .pipe(replace('<html><head></head><body>', ''))
    .pipe(replace('</body></html>', ''))
    .pipe(gulpif(siteSetting.useSSI === true, gulp.dest(setting.io.output.htmlSSI + 'ssi/')))
}

/**
 * getImageLists
 * @param {boolean} onlyManual
 */
const getImageLists = onlyManual => {
  // defaultLists
  const defaultLists = setting.io.input.img + '**/*.{png,apng,jpg,gif,svg,ico,webp}'

  // lists
  const lists = []

  if (onlyManual) {
    // push imageManualLists
    for (let i = 0; i < setting.imageManualLists.length; i = (i + 1) | 0) {
      lists.push(setting.io.input.img + setting.imageManualLists[i])
    }
  } else {
    // push defaultLists
    lists.push(defaultLists)

    // push ignore imageManualLists
    for (let i = 0; i < setting.imageManualLists.length; i = (i + 1) | 0) {
      lists.push('!' + setting.io.input.img + setting.imageManualLists[i])
    }
  }

  return lists
}

/**
 * img
 */
const img = () => {
  return gulp
    .src(getImageLists(false))
    .pipe(plumber({ errorHandler: err => { console.log(err.messageFormatted); this.emit('end') } }))
    .pipe(newer(setting.io.output.img))
    .pipe(
      imagemin([
        pngquant(setting.pngquant),
        mozjpeg(setting.mozjpeg),
        imagemin.svgo(setting.svgo),
        imagemin.gifsicle(setting.gifsicle)
      ])
    )
    .pipe(gulp.dest(setting.io.output.img))
    .pipe(gulpif(siteSetting.useWebp === true, webp()))
    .pipe(gulpif(siteSetting.useWebp === true, gulp.dest(setting.io.output.img)))
}

/**
 * imgManual
 * 手動で圧縮率を設定する場合のタスクです。
 * 特定の画像の圧縮率を下げたい場合等で使用する事を想定しています。
 * 設定記述：setting.jsonのpngquantManualとmozjpegManual
 * @param {*} cb
 */
const imgManual = cb => {
  const imageLists = getImageLists(true)
  if (imageLists.length !== 0) {
    return gulp
      .src(imageLists)
      .pipe(plumber({ errorHandler: err => { console.log(err.messageFormatted); this.emit('end') } }))
      .pipe(newer(setting.io.output.img))
      .pipe(
        imagemin([
          pngquant(setting.pngquantManual),
          mozjpeg(setting.mozjpegManual),
          imagemin.gifsicle(setting.gifsicleManual)
        ])
      )
      .pipe(gulp.dest(setting.io.output.img))
      .pipe(gulpif(siteSetting.useWebp === true, webp()))
      .pipe(gulpif(siteSetting.useWebp === true, gulp.dest(setting.io.output.img)))
  } else {
    cb()
  }
}

/**
 * js
 */
const js = () => {
  return gulp
    .src(setting.io.input.js + '**/*.js')
    .pipe(plumber({ errorHandler: err => { console.log(err.messageFormatted); this.emit('end') } }))
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(setting.io.output.js))
}

/**
 * jsBuild
 */
const jsBuild = () => {
  return gulp
    .src(setting.io.input.js + '**/*.js')
    .pipe(plumber({ errorHandler: err => { console.log(err.messageFormatted); this.emit('end') } }))
    .pipe(webpackStream(webpackConfigBuild, webpack))
    .pipe(gulp.dest(setting.io.output.js))
}

/**
 * sitemap
 */
const sitemapBuild = () => {
  return gulp
    .src([setting.io.output.html + '/**/*.html', '!' + setting.io.output.html + 'ssi/*.html'], {read: false})
    .pipe(
      plumber({
        errorHandler: err => {
          console.log(err.messageFormatted)
          this.emit('end')
        }
      })
    )
    .pipe(sitemap({
      siteUrl: siteSetting.siteDomainProduction
    }))
    .pipe(gulp.dest(setting.io.output.html))
}

/**
 * icon fonts
 */
const iconfont = () => {
  const fontOptions = {
    fontName: iconfontName,
    startUnicode: 0xf001,
    // formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
  }

  const iconStream = src(iconsPaths.src)
    .pipe($.imagemin([$.imagemin.svgo()]))
    .pipe($.iconfont(fontOptions))

  return iconStream
    .on('glyphs', function (glyphs, options) {
      const engine = 'lodash',
        className = 'icon'

      glyphs = glyphs.map(function (glyph) {
        return {
          name: glyph.name,
          codepoint: glyph.unicode[0].charCodeAt(0).toString(16), // convert decimal to hex
        }
      })

      let cssHtmlOptionsFontPath = `../../dist/${iconsAssets}/`

      const cssHtmlOptions = {
        glyphs: glyphs,
        fontName: options.fontName,
        fontPath: cssHtmlOptionsFontPath,
        className: className,
        cacheBusterQueryString: options.timestamp,
      }

      const scssOptions = {
        glyphs: glyphs,
        fontName: options.fontName,
        fontPath: `..${iconsFolder}/`,
        className: className,
        cacheBusterQueryString: options.timestamp,
      }

      // scss
      src(`${iconsPaths.templates}/icons.styles`)
        .pipe($.consolidate(engine, scssOptions))
        .pipe(
          $.rename({
            basename: '_icons',
            extname: '.scss',
          })
        )
        .pipe(dest(`./src/assets/css/scss/fundation/`))

      // css - アイコン確認用
      src(`${iconsPaths.templates}/icons.styles`)
        .pipe($.consolidate(engine, cssHtmlOptions))
        .pipe(
          $.rename({
            basename: options.fontName,
            extname: '.css',
          })
        )
        .pipe(dest(iconsPaths.srcGlob))

      // html - アイコン確認用
      src(`${iconsPaths.templates}/icons.html`)
        .pipe($.consolidate(engine, cssHtmlOptions))
        .pipe(
          $.rename({
            basename: 'index',
          })
        )
        .pipe(dest(iconsPaths.srcGlob))
    })
    .pipe(
      dest('./dist/assets/icons')
    )
}

/**
 * static copy
 */
const staticCopy = () => {
  return gulp
    .src(staticSrc)
    .pipe(dest('./dist/assets'))
}



/**
 * watch
 */
const watch = () => {
  gulp.watch(setting.io.input.css + '**/*.scss', scss)
  gulp.watch(setting.io.input.img + '**/*', gulp.series(img, imgManual))
  gulp.watch(setting.io.input.js + '**/*.js', gulp.series(js, reload))
  gulp.watch(setting.io.input.ejs + '**/*.ejs', { interval: 250 }, gulp.series(ejsCompile, reload))
  gulp.watch(setting.io.input.ejs + '**/*.ejs', { interval: 250 }, gulp.series(ejsCompileSSI, reload))
}

/**
 * genDir
 * @param {string} dirname
 * @param {string} type
 */
const genDir = (dirname, type) => {
  dirname = typeof dirname !== 'undefined' ? dirname : 'publish_data'

  const distname = 'dist'
  const userHome = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']
  const publishDir = path.join(userHome, setting.publishDir)

  const srcIgnore = [
    distname + '/**/*',
    '!' + distname + '/**/maps',
    '!' + distname + '/**/*.map',
    '!' + distname + '/**/*.DS_Store',
    '!' + distname + '/**/*.LICENSE',
    '!' + distname + '/**/*Thumbs.db'
  ]

  if (type === 'zip') {
    return gulp
      .src(srcIgnore)
      .pipe(zip(dirname + '.zip'))
      .pipe(gulp.dest(publishDir))
      .pipe(
        notify({
          title: '納品データをZIP化しました 🗜',
          message: '出力先：' + publishDir + '/' + dirname + '.zip'
        })
      )
  } else {
    return gulp
      .src(srcIgnore)
      .pipe(gulp.dest(dirname))
  }
}

/**
 * genPublishDir
 * @param {function} cb
 */
const genPublishDir = cb => {
  genDir('dist-production', 'publish')
  cb()
}

/**
 * genPublishFullPathDir
 * @param {function} cb
 */
const genPublishFullPathDir = cb => {
  genDir('dist-production-fullpath', 'publish-fullpath')
  cb()
}

/**
 * ejsCompileFullPath
 * @param {function} cb
 */
const ejsCompileFullPath = cb => {
  ejsCompile('fullpath')
  cb()
}
const ejsCompileFullPathSSI = cb => {
  ejsCompileSSI('fullpath')
  cb()
}

/**
 * genZipArchive
 * @param {function} cb
 */
const genZipArchive = cb => {
  // サイト設定ファイルの読み込み.
  const siteSetting = JSON.parse(fs.readFileSync('./setting-site.json', 'utf8'))

  // 納品ファイル作成
  const dt = new Date()
  const date = dt.toFormat('YYMMDD-HHMI')
  const dirname = 'publish__' + date + '__' + siteSetting.publishFileName
  genDir(dirname, 'zip')
  cb()
}

exports.default = gulp.series(jsoncFileCeck, gulp.parallel(watch, sync))
exports.development = gulp.series(jsoncFileCeck, clean, iconfont, scss, cleanImg, img, imgManual, ejsCompile, ejsCompileSSI, js, staticCopy)
exports.developmentRestore = gulp.series(jsoncFileCeck, iconfont, ejsCompile, ejsCompileSSI, js, staticCopy)
exports.production = gulp.series(jsoncFileCeck, clean, iconfont, scssProduction, cleanImg, img, imgManual, cleanEjs, ejsCompile, ejsCompileSSI, jsBuild, cleanGarbage, genPublishDir, staticCopy)
exports.productionFullpath = gulp.series(jsoncFileCeck, clean, iconfont, scssProduction, cleanImg, img, imgManual, cleanEjs, ejsCompileFullPath, ejsCompileFullPathSSI, jsBuild, sitemapBuild, cleanGarbage, genPublishFullPathDir, staticCopy)

exports.checkJson = jsoncFileCeck
exports.zip = gulp.series(jsoncFileCeck, iconfont, scssProduction, cleanImg, img, imgManual, cleanEjs, ejsCompile, ejsCompileSSI, jsBuild, cleanGarbage, genZipArchive)
exports.resetImg = gulp.series(cleanImg, img, imgManual)
exports.resetEjs = gulp.series(cleanEjs, ejsCompile, ejsCompileSSI)
exports.garbage = cleanGarbage
