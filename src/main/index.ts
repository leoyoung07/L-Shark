import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production';

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null;

function createMainWindow() {
  const window = new BrowserWindow();

  if (isDevelopment) {
    // window.webContents.openDevTools();
  }

  if (isDevelopment) {
    // window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    window.loadURL('https://api.github.com/');
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      })
    );
  }

  window.on('closed', () => {
    mainWindow = null;
  });

  window.webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  try {
    window.webContents.debugger.attach('1.1');
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log('Debugger attach failed : ', err);
  }

  window.webContents.debugger.on('detach', (event, reason) => {
    // tslint:disable-next-line:no-console
    console.log('Debugger detached due to : ', reason);
  });

  window.webContents.debugger.on('message', (event, method, params) => {
    if (method === 'Network.responseReceived') {
      if (params.requestId && params.response && params.type.toUpperCase() === 'DOCUMENT') {
        window.webContents.debugger.sendCommand('Network.getResponseBody', {
          'requestId': params.requestId
        }, (error, response) => {
          // tslint:disable-next-line:no-console
          console.log(error, response);
          // window.webContents.debugger.detach();
        });
      }
    }
  });

  window.webContents.debugger.sendCommand('Network.enable');

  return window;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow();
});
