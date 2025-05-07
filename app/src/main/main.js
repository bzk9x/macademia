const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 750,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: false
  })

  win.loadFile('app/src/main/res/layout/screen_home.html')

  // Window control handlers
  ipcMain.on('minimize-window', () => {
    win.minimize()
  })

  ipcMain.on('maximize-window', () => {
    if (win.isMaximized()) {
      win.restore()
    } else {
      win.maximize()
    }
  })

  ipcMain.on('close-window', () => {
    win.close()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})