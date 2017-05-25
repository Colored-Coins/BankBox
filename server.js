global.casimir = require('./casimir')
var casimir = global.casimir
var server = casimir.server
var path = require('path')
var cp = require('child_process')

function tryStartColoredCoinsFullNode () {
  var fullNodeModulePath = path.join(__dirname, 'node_modules/coloredcoins-full-node')
  var fullNodeEntry = require(path.join(fullNodeModulePath, 'package.json')).main
  var fullNodeServerPath = path.join(fullNodeModulePath, fullNodeEntry)
  var fullNodeServer = cp.fork(fullNodeServerPath, [], {stdio: ['ignore', 'ignore', process.stderr, 'ipc']})

  fullNodeServer.on('close', function (code) {
    if (code === 0 || code === 2) return
    console.error('fullNodeServer closed with code,', code)
  })

  fullNodeServer.on('error', function (code) {
    if (code === 0 || code === 2) return
    console.error('fullNodeServer exited with error code,', code)
  })
}

module.exports = {
  init: function (cb) {
    tryStartColoredCoinsFullNode()
    server.http_server.listen(server.port, function (err) {
      if (err) return cb(err)
      console.log('Server started on port', server.port)
      cb()
    })
  }
}
