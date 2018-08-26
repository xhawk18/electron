const features = process.atomBinding('features')
const v8Util = process.atomBinding('v8_util')

const enableRemoteModule = v8Util.getHiddenValue(global, 'enableRemoteModule')

// Renderer side modules, please sort alphabetically.
// A module is `enabled` if there is no explicit condition defined.
module.exports = [
  {
    name: 'desktopCapturer',
    file: 'desktop-capturer',
    enabled: features.isDesktopCapturerEnabled()
  },
  {name: 'ipcRenderer', file: 'ipc-renderer', enabled: true},
  {name: 'remote', file: 'remote', enabled: enableRemoteModule},
  {name: 'screen', file: 'screen', enabled: enableRemoteModule},
  {name: 'webFrame', file: 'web-frame', enabled: true}
]
