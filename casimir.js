var path = require('path')
var express = require('express')
var ospath = require('ospath')
var fs = require('fs')
var ini = require('iniparser')
var casimirCore = require('casimircore')()

var properties = require(path.join(__dirname, 'config/index.js'))()

// normalize paths
properties.server.favicon = path.join(__dirname, properties.server.favicon)
properties.engine.view_folder = path.join(__dirname, properties.engine.view_folder)
properties.engine.static_folder = path.join(__dirname, properties.engine.static_folder)

// full node properties
var fullNodePropertiesFilePath = path.join(ospath.data(), 'coloredcoins-full-node', 'properties.conf')
if (!fs.existsSync(fullNodePropertiesFilePath)) {
  fullNodePropertiesFilePath = path.join(__dirname, 'node_modules/coloredcoins-full-node/properties.conf')
}
properties.fullNode = ini.parseSync(fullNodePropertiesFilePath)

var logSettings = {
  env: properties.ENV.type,
  log_dir: path.join(__dirname, 'app/log')
}

var logger = global.logger = casimirCore.logger(logSettings)
console.log = logger.info
console.error = logger.error
console.warn = logger.warn

var router = casimirCore.router(path.join(__dirname, 'routes'), path.join(__dirname, 'app/controllers'))
router.use('/js', express.static(path.join(__dirname, 'node_modules')))
router.use('/css', express.static(path.join(__dirname, 'node_modules')))

// Add custom framwork modules for server
properties.modules = {
  router: router,
  logger: logger,
  error: casimirCore.error(properties.ENV.type)
}

// Set server and server port
var server = casimirCore.server(properties)

var casimir = {
  server: server,
  logger: logger,
  properties: properties
}

module.exports = casimir
