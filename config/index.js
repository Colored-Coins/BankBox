var ini = require('iniparser')
var _ = require('lodash')
var path = require('path')
var ospath = require('ospath')
var fs = require('fs')

module.exports = function () {
  var defaultProperties = {}
  var defaultPropertiesPath = path.join(__dirname, 'properties.conf')
  if (!fs.existsSync(defaultPropertiesPath)) {
    throw new Error('Can\'t find default properties')
  }
  defaultProperties = ini.parseSync(defaultPropertiesPath)

  var customProperties = {}
  var customPropertiesPath = path.join(ospath.data(), 'BankBox', 'properties.conf')
  if (fs.existsSync(customPropertiesPath)) {
    // copy file
    customProperties = ini.parseSync(customPropertiesPath)
  }

  _.assign(defaultProperties, customProperties)

  return defaultProperties
}
