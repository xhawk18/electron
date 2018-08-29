'use strict'

const electron = require('electron')
const binding = process.atomBinding('crash_reporter')

const crashReporterInit = function (options) {
  let channel = 'ELECTRON_CRASH_REPORTER_INIT'
  if (process.type === 'browser') {
    let event = {}
    electron.ipcMain.emit(channel, event, options)
    return event.returnValue
  } else {
    return electron.ipcRenderer.sendSync(channel, options)
  }
}

class CrashReporter {
  start (options) {
    if (options == null) options = {}

    let {
      productName,
      companyName,
      extra,
      ignoreSystemCrashHandler,
      submitURL,
      uploadToServer
    } = options

    if (uploadToServer == null) {
      uploadToServer = true
    }

    if (ignoreSystemCrashHandler == null) {
      ignoreSystemCrashHandler = false
    }

    if (companyName == null) {
      throw new Error('companyName is a required option to crashReporter.start')
    }
    if (submitURL == null) {
      throw new Error('submitURL is a required option to crashReporter.start')
    }

    const ret = crashReporterInit({
      submitURL,
      productName
    })

    this.crashesDirectory = ret.crashesDirectory
    this.productName = productName || ret.appName

    if (extra == null) extra = {}

    if (extra._productName == null) extra._productName = productName
    if (extra._companyName == null) extra._companyName = companyName
    if (extra._version == null) extra._version = ret.appVersion

    binding.start(this.getProductName(), companyName, submitURL, this.getCrashesDirectory(), uploadToServer, ignoreSystemCrashHandler, extra)
  }

  getLastCrashReport () {
    const reports = this.getUploadedReports()
      .sort((a, b) => {
        const ats = (a && a.date) ? new Date(a.date).getTime() : 0
        const bts = (b && b.date) ? new Date(b.date).getTime() : 0
        return bts - ats
      })

    return (reports.length > 0) ? reports[0] : null
  }

  getUploadedReports () {
    return binding.getUploadedReports(this.getCrashesDirectory())
  }

  getCrashesDirectory () {
    return this.crashesDirectory
  }

  getProductName () {
    return this.productName
  }

  getUploadToServer () {
    if (process.type === 'browser') {
      return binding.getUploadToServer()
    } else {
      throw new Error('getUploadToServer can only be called from the main process')
    }
  }

  setUploadToServer (uploadToServer) {
    if (process.type === 'browser') {
      return binding.setUploadToServer(uploadToServer)
    } else {
      throw new Error('setUploadToServer can only be called from the main process')
    }
  }

  addExtraParameter (key, value) {
    binding.addExtraParameter(key, value)
  }

  removeExtraParameter (key) {
    binding.removeExtraParameter(key)
  }

  getParameters (key, value) {
    return binding.getParameters()
  }
}

module.exports = new CrashReporter()
