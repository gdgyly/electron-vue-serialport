/* eslint-disable quotes */
'use strict'

import {
  app,
  BrowserWindow
} from 'electron'

const SerialPort = require('serialport')

const {
  ipcMain
} = require('electron')

var port = null

// require('electron-reloader')(module)

// global.SerialPort = serialPort

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      nodeIntegration: true // 在网页中集成Node
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.on('find-serialport', (event, arg) => {
  console.log(arg) // prints "ping"
  SerialPort.list().then(
    ports => {
      // ports 串口信息
      console.log(ports)
      event.reply('findserialport-reply', ports)
    }
  )
})

ipcMain.on('open-serialport', (event, arg) => {
  console.log(arg) // prints "ping"
  // port = new SerialPort('COM5')
  port = new SerialPort(arg.name, {
    baudRate: arg.baudRate,
    parity: arg.parity,
    dataBits: arg.dataBit,
    stopBits: arg.stopBit,
    autoOpen: false
  })

  port.open(function (err) {
    if (err) {
      console.log(err)
    }
  })

  console.log('打开', port)

  port.on('data', function (data) {
    console.log("接收到数据:", data.toString())
    event.reply('rece-serialport', handlerHexDisplay(data.toString('hex').toLocaleUpperCase()))
  })

  port.on('error', (error) => {
    console.log(error)
  })
})

ipcMain.on('close-serialport', (event, arg) => {
  console.log(arg)
  console.log('关串口！')
  if (port != null) {
    port.close()
    port = null
  }
})

ipcMain.on('send-serialport', (event, arg) => {
  if (port.isOpen) {
    port.write(handlerHex(arg), 'hex', function (err, result) {
      if (err) {
        console.log(err)
      }
    })
  }
})

function handlerHex (data) {
  let dataStr = ''
  if (data.trim().indexOf(' ') > -1) {
    let hexArr = data.trim().split(' ')
    for (let i in hexArr) {
      if (hexArr[i].length === 1) {
        dataStr += '0'
      }
      dataStr += hexArr[i]
    }
  } else {
    dataStr = handlerHexDisplay(data.trim())
  }
  return dataStr.replace(/\s+/g, '')
}

function handlerHexDisplay (data) {
  let dataStr = ''
  let isOdd = true
  if (data.length % 2 === 0) {
    isOdd = false
  }
  for (let i = 0, len = data.length; i < len; i++) {
    // 自动补零
    if (isOdd && len - i === 1) {
      dataStr += '0'
    }
    // 字符拼接
    dataStr += data.charAt(i)
    // 每两个字符加一个空格
    if (i % 2 > 0 || len - i === 1) {
      dataStr += ' '
    }
  }
  return dataStr
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.allowRendererProcessReuse = false
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
