
import fs from 'fs'

let dirname  // TODO: where did __dirname go ?

const serve = (req, res, nxt) => {
  if (!req || !res) {
    return false
  }

  const next = nxt || serve

  if (!req.url) {
    return next()
  }

  if (0 <= req.url.indexOf('gun.js')) {
    res.writeHead(200, { 'Content-Type': 'text/javascript' })
    res.end(serve.js = serve.js || fs.readFileSync(dirname + '/gun.js'))
    return true
  }

  if (0 <= req.url.indexOf('gun/')) {
    res.writeHead(200, { 'Content-Type': 'text/javascript' })
    var path = dirname + '/' + req.url.split('/').slice(2).join('/'), file
    try {
      file = fs.readFileSync(path)
    } catch(e) {} // eslint-disable-line no-empty
    if (file) {
      res.end(file)
      return true
    }
  }

  return next()
}

export default (dir) => {
  dirname = dir
  return serve
}
