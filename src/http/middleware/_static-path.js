let { existsSync, readdirSync, statSync } = require('fs')
let path = require('path')
let send = require('send')
let url = require('url')

/**
 * Serves static assets out of /_static
 */
module.exports = function _static ({ staticPath }, req, res, next) {
  let isStatic = req.url.startsWith('/_static')
  if (isStatic) {
    sends(staticPath, req, res, next)
  }
  else {
    next()
  }
}

function sends (staticPath, req, res) {
  let basePath = req.url.replace('/_static', '')
  if (!basePath || basePath === '/') {
    basePath = 'index.html'
  }

  let pathToFile = url.parse(basePath).pathname
  let fullPath = path.join(staticPath, decodeURI(pathToFile))
  let { dir, base } = path.parse(fullPath)
  let found = false
  if (existsSync(dir)) {
    let files = readdirSync(dir)
    found = files.includes(base) && statSync(fullPath).isFile()
  }

  if (!found) {
    res.statusCode = 404
    res.end(`NoSuchKey: ${fullPath} not found`)
  }
  else {
    function error (err) {
      res.statusCode = err.status || 500
      res.end(err.message)
    }

    function redirect () {
      res.statusCode = 301
      res.setHeader('Location', req.url + '/')
      res.end('\n')
    }

    send(req, pathToFile, { root: staticPath })
      .on('error', error)
      .on('directory', redirect)
      .pipe(res)
  }
}
