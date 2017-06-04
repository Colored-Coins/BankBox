var casimir = global.casimir
var properties = casimir.properties
var QRCode = require('qrcode')

function getFullNodeUrl () {
  if (!properties.fullNodeAutoRun && properties.fullNodeRemoteUrl) {
    return properties.fullNodeRemoteUrl
  }
  var fullNodeServerProperties = properties.fullNode.server
  var host = 'localhost'
  var protocol
  var port
  if (fullNodeServerProperties.usessl || fullNodeServerProperties.useBoth) {
    protocol = 'https'
    port = fullNodeServerProperties.httpsPort
  } else {
    protocol = 'http'
    port = fullNodeServerProperties.httpPort
  }
  return `${protocol}://${host}:${port}`
}

module.exports = {
  index: function (req, res, next) {
    res.render('index', {
      network: properties.bitcoin.network,
      fee: properties.bitcoin.fee,
      blockExplorerUIUrl: properties.webhosts.explorer, // TODO: remove after we open-source explorer UI
      dashboardUrl: properties.dashboard.url,
      dashboardVersion: properties.dashboard.version,
      fullNodeUrl: getFullNodeUrl()
    })
  },
  isRunning: function (req, res, next) {
    res.send('OK')
  },
  generateQR: function (req, res, next) {
    QRCode.toDataURL(req.data.address, {color: {light: '#0000'}, margin: 0, scale: 8}, function (err, url) {
      if (err) return res.send(err)
      if (req.data.src) {
        var png = url.split(',')[1]
        res.type('png')
        res.send(new Buffer(png, 'base64'))
      } else {
        var doc = "<html><head></head><body><div style='position: fixed; left: calc(50% - 120px); top: calc(50% - 120px)'><img src='" + url + "'></img></div></body></html>"
        res.send(doc)
      }
    })
  }
}
