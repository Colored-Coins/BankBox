#!/usr/bin/env node
'use strict'

/**
 * Build app binaries.
 */

const cp = require('child_process')
const electronPackager = require('electron-packager')
const innoSetupCompiler = require('innosetup-compiler')
const fs = require('fs')
const minimist = require('minimist')
const os = require('os')
const download = require('download')
const path = require('path')
const rimraf = require('rimraf')
const series = require('run-series')
const zip = require('cross-zip')
const dedent = require('dedent')

const pkg = require('../package.json')
const properties = require(path.join(__dirname, '../config/index.js'))()

const APP_NAME = properties.app.name
const APP_TEAM = properties.app.team
const ROOT_DIR = path.join(__dirname, '..')
const STATIC_PATH = path.join(ROOT_DIR, properties.engine.static_folder)
const APP_VERSION = pkg.version
const BUILD_NAME = APP_NAME + '-v' + APP_VERSION
const BUILD_PATHS = [path.join(STATIC_PATH, 'js', 'build'), path.join(STATIC_PATH, 'css', 'build')]
const DIST_PATH = path.join(ROOT_DIR, 'dist')
const DEPENDENCIES_PATH = path.join(ROOT_DIR, 'dependencies')
const APP_ICON = path.join(STATIC_PATH, 'img', APP_NAME)
const NODE_MODULES_PATH = path.join(ROOT_DIR, 'node_modules')

const argv = minimist(process.argv.slice(2), {
  boolean: [
    'sign'
  ],
  default: {
    package: 'all',
    sign: false
  },
  string: [
    'package'
  ]
})

function build () {
  console.log('Removing node_modules...')
  rimraf.sync(NODE_MODULES_PATH)
  cp.execSync('npm install', { stdio: 'inherit' })
  cp.execSync('npm dedupe', { stdio: 'inherit' })

  console.log('Remvoing existing dist/ and build/...')
  rimraf.sync(DIST_PATH)
  BUILD_PATHS.forEach(buildPath => rimraf.sync(buildPath))

  console.log('Building...')
  cp.execSync('npm run build', {NODE_ENV: 'production', stdio: 'inherit'})

  buildWin(printDone)
}

const all = {
  // The release version of the application. Maps to the `ProductVersion` metadata
  // property on Windows, and `CFBundleShortVersionString` on Mac.
  appVersion: APP_VERSION,

  // Package the application's source code into an archive, using Electron's archive
  // format. Mitigates issues around long path names on Windows and slightly speeds up
  // require().
  asar: {
    // A glob expression, that unpacks the files with matching names to the
    // "app.asar.unpacked" directory.
    unpack: APP_NAME + '*'
  },

  // The build version of the application. Maps to the FileVersion metadata property on
  // Windows, and CFBundleVersion on Mac. Note: Windows requires the build version to
  // start with a number. We're using the version of the underlying ColoredCoins-SDK library.
  buildVersion: require('coloredcoins-sdk/package.json').version,

  // The application source directory.
  dir: ROOT_DIR,

  // Pattern which specifies which files to ignore when copying files to create the
  // package(s).
  ignore: /^\/dist|\/(appveyor.yml|\.appveyor.yml|\.travis.yml|\.github|appdmg|AUTHORS|CONTRIBUTORS|bin|component\.json|coverage|Makefile|minimist|static\/screenshot\.png|dependencies|test|tests|test\.js|tests\.js|coloredcoins\.client\.js|\.[^/]*|.*\.md|.*\.markdown)$/,

  // The application name.
  name: APP_NAME,

  // The base directory where the finished package(s) are created.
  out: DIST_PATH,

  // Replace an already existing output directory.
  overwrite: true,

  // Runs `npm prune --production` which remove the packages specified in
  // "devDependencies" before starting to package the app.
  prune: true,

  // The Electron version that the app is built with (without the leading 'v')
  electronVersion: require('electron/package.json').version
}

const win = {
  // Build for Windows.
  platform: 'win32',

  // Build ia32 and x64 binaries.
  arch: ['ia32', 'x64'],

  // Object hash of application metadata to embed into the executable (Windows only)
  win32metadata: {

    // Company that produced the file.
    CompanyName: APP_TEAM,

    // Name of the program, displayed to users
    FileDescription: APP_NAME,

    // Original name of the file, not including a path. This information enables an
    // application to determine whether a file has been renamed by a user. The format of
    // the name depends on the file system for which the file was created.
    OriginalFilename: APP_NAME + '.exe',

    // Name of the product with which the file is distributed.
    ProductName: APP_NAME,

    // Internal name of the file, if one exists, for example, a module name if the file
    // is a dynamic-link library. If the file has no internal name, this string should be
    // the original filename, without extension. This string is required.
    InternalName: APP_NAME
  },

  // Application icon.
  icon: APP_ICON + '.ico'
}

build()

function buildWin (cb) {
  console.log('Windows: Packaging electron...')

  electronPackager(Object.assign({}, all, win), function (err, buildPath) {
    if (err) return cb(err)
    console.log('Windows: Packaged electron. ' + buildPath)

    // TODO - sign !
    const tasks = []
    buildPath.forEach(function (filesPath) {
      const destArch = filesPath.split('-').pop()

      if (argv.package === 'exe' || argv.package === 'all') {
        tasks.push((cb) => packageInstaller(filesPath, destArch, cb))
      }
      if (argv.package === 'portable' || argv.package === 'all') {
        tasks.push((cb) => packagePortable(filesPath, destArch, cb))
      }
    })
    series(tasks, cb)

    function packageInstaller (filesPath, destArch, cb) {
      console.log(`Windows: Creating ${destArch} installer...`)

      var archStr = destArch === 'ia32' ? '32' : '64'
      series([
        function (cb) {
          console.log('  downloading Bitcoin-Core ' + archStr + 'bit setup...')
          download('https://bitcoin.org/bin/bitcoin-core-0.14.1/bitcoin-0.14.1-win' + archStr + '-setup.exe', DEPENDENCIES_PATH).then(() => {
            console.log('  done downloading Bitcoin-Core setup.')
            cb()
          })
        },
        function (cb) {
          console.log('  downloading Redis ' + archStr + 'bit setup...')
          download('http://ruilopes.com/redis-setup/binaries/redis-2.4.6-setup-' + archStr + '-bit.exe', DEPENDENCIES_PATH).then(() => {
            console.log('  done downloading Redis setup.')
            cb()
          })
        },
        function (cb) {
          fs.writeFile(path.join(__dirname, 'win' + archStr + '.iss'), dedent(`
            #define MyAppName "BankBox"
            #define MyAppVersion "0.1.0"
            #define MyAppPublisher "ColoredCoins.org"
            #define MyAppURL "http://www.coloredcoins.org/"
            #define MyAppExeName "BankBox.exe"
            #define Bitcoin${archStr} "bitcoin-0.14.1-win${archStr}-setup.exe"
            #define Redis${archStr} "redis-2.4.6-setup-${archStr}-bit.exe"

            [Setup]
            AppName={#MyAppName}
            AppVersion={#MyAppVersion}
            AppVerName={#MyAppName} {#MyAppVersion}
            AppPublisher={#MyAppPublisher}
            AppPublisherURL={#MyAppURL}
            AppSupportURL={#MyAppURL}
            AppUpdatesURL={#MyAppURL}
            DefaultDirName={pf}\\{#MyAppName}
            DisableProgramGroupPage=yes
            OutputDir=..
            OutputBaseFilename=${BUILD_NAME}-win-${destArch}-setup
            Compression=lzma
            SolidCompression=yes
            SourceDir=..\\dist\\BankBox-win32-${destArch}
            AlwaysShowDirOnReadyPage=yes
            DisableDirPage=no

            [Types]
            Name: "full"; Description: "Full installation, including Bitcoin-core and Redis. (recommended)"
            Name: "compact"; Description: "Compact installation, assumes Bitcoin-core and Redis installed on machine."
            Name: "custom"; Description: "Custom installation"; Flags: iscustom

            [Components]
            Name: "BankBox"; Description: "BankBox"; Types: full compact; Flags: fixed
            Name: "bitcoin_core"; Description: "Bitcoin core client. You do not have to install it if it is already installed on your machine."; Types: full; ExtraDiskSpaceRequired: 160456270630
            Name: "redis"; Description: "Redis db service. You do not have to install it if it is already installed on your machine."; Types: full; ExtraDiskSpaceRequired: 209715200

            [Languages]
            Name: "english"; MessagesFile: "compiler:Default.isl"

            [Tasks]
            Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

            [Files]
            Source: "BankBox.exe"; DestDir: "{app}"; Flags: ignoreversion
            Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
            Source: "..\\..\\config\\properties.conf"; DestDir: "{userappdata}\\BankBox"; DestName: "properties.conf"; Flags: onlyifdoesntexist
            Source: "..\\../node_modules\\coloredcoins-full-node\\properties.conf"; DestDir: "{userappdata}\\coloredcoins-full-node"; Flags: onlyifdoesntexist
            Source: "..\\..\\dependencies\\{#Bitcoin${archStr}}"; DestDir: "{tmp}"; Flags: deleteafterinstall
            Source: "..\\..\\dependencies\\{#Redis${archStr}}"; DestDir: "{tmp}"; Flags: deleteafterinstall

            [Icons]
            Name: "{commonprograms}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"
            Name: "{commondesktop}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"; Tasks: desktopicon

            [Run]
            Filename: "{app}\\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent unchecked
            Filename: "{tmp}\\{#Bitcoin${archStr}}"; Components: bitcoin_core
            Filename: "{tmp}\\{#Redis${archStr}}"; Components: redis
          `), cb)
        },
        function (cb) {
          innoSetupCompiler(path.join(__dirname, 'win' + archStr + '.iss'), {O: DIST_PATH}, function (err) {
            if (err) return cb(err)
            console.log(`Windows: Created ${destArch} installer...`)
            cb()
          })
        }
      ], cb)
    }

    function packagePortable (filesPath, destArch, cb) {
      console.log(`Windows: Creating ${destArch} portable app...`)

      const inPath = path.join(DIST_PATH, path.basename(filesPath))
      const outPath = path.join(DIST_PATH, BUILD_NAME + '-win-' + destArch + '.zip')
      zip.zipSync(inPath, outPath)

      console.log(`Windows: Created ${destArch} portable app.`)
      cb(null)
    }
  })
}

function printDone (err) {
  if (err) console.error(err.message || err)
}

/*
 * Print a large warning when signing is disabled so we are less likely to accidentally
 * ship unsigned binaries to users.
 */
function printWarning () {
  console.log(fs.readFileSync(path.join(__dirname, 'warning.txt'), 'utf8'))
}
