import { fork } from 'child_process';
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';
import Monitor from './Monitor';

const isDevelopment = process.env.NODE_ENV !== 'production';

const isDebug = !!process.env.DEBUG;

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null;

function createMainWindow() {
  const window = new BrowserWindow();

  if (isDevelopment) {
    window.webContents.openDevTools();
  }

  let url: string;
  if (isDevelopment) {
    url = `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`;
  } else if (isDebug) {
    url = formatUrl({
      pathname: path.resolve(__dirname, '..', 'renderer', 'index.html'),
      protocol: 'file',
      slashes: true
    });
  } else {
    url = formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    });
  }

  window.loadURL(url);

  window.on('closed', () => {
    mainWindow = null;
  });

  window.webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  window.webContents.on('did-finish-load', () => {
    let proxyWorkerPath: string;
    if (isDevelopment) {
      proxyWorkerPath = path.resolve(__dirname, '..', '..', 'dist', 'main', 'ProxyWorker.js');
    } else {
      proxyWorkerPath = path.resolve(__dirname, './ProxyWorker.js');
    }
    const worker = fork(proxyWorkerPath);
    worker.on('message', (message) => {
      if (message.type === 'get-request') {
        window.webContents.send('get-request', message.data);
      } else if (message.type === 'get-response') {
        window.webContents.send('get-response', message.data);
      } else if (message.type === 'connect-error') {
        window.webContents.send('connect-error', message.data);
      } else if (message.type === 'error') {
        // tslint:disable-next-line:no-console
        console.log(message.data);
        window.webContents.send('error', message.data);
      }
    });
  });

  ipcMain.on('load-url', async (event: Electron.Event, args: string) => {
    const monitor = new Monitor();
    monitor.show();
    await monitor.load(args);
  });

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
