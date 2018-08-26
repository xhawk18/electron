const {remote} = require('electron')

if (process.platform === 'linux' && process.type === 'renderer') {
  // On Linux we could not access clipboard in renderer process.
  if (remote) {
    module.exports = remote.clipboard
  } else {
    throw new Error('clipboard requires remote, which is not enabled')
  }
} else {
  const clipboard = process.atomBinding('clipboard')

  // Read/write to find pasteboard over IPC since only main process is notified
  // of changes
  if (process.platform === 'darwin' && process.type === 'renderer') {
    if (remote) {
      clipboard.readFindText = remote.clipboard.readFindText
      clipboard.writeFindText = remote.clipboard.writeFindText
    } else {
      delete clipboard.readFindText
      delete clipboard.writeFindText
    }
  }

  module.exports = clipboard
}
