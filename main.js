const electron = require('electron')
const {app, BrowserWindow} = electron
const contextMenu = require('electron-context-menu')
const server = require('./server')
const properties = global.casimir.properties
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  server.init(err => {
    if (err) return console.error('Critical error so killing app. Error =', err)
    // Create the browser window.
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
    const icon = path.join(__dirname, '/app/public/img/BankBox.ico')

    // Create a context menu to be attached to any BrowserWindow
    contextMenu()

    mainWindow = new BrowserWindow({width, height, icon, minWidth: 1056, minHeight: 800})
    mainWindow.maximize()

    mainWindow.loadURL(properties.dashboard.url)

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
