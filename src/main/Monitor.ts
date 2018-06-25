import { BrowserWindow } from 'electron';
class Monitor {

  private newWin: BrowserWindow | null;
  constructor(width: number = 400, height: number = 320) {
    this.newWin = new BrowserWindow({ width: width, height: height });
    this.newWin.on('close', () => { this.newWin = null; });

    try {
      this.newWin.webContents.debugger.attach('1.1');
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.log('Debugger attach failed : ', err);
    }
    this.newWin.webContents.debugger.sendCommand('Network.enable');

    this.newWin.webContents.debugger.on('detach', (event, reason) => {
      // tslint:disable-next-line:no-console
      console.log('Debugger detached due to : ', reason);
    });

    this.newWin.webContents.debugger.on('message', async (event, method, params) => {
      if (method === 'Network.responseReceived') {
        if (params.requestId && params.response) {
          // tslint:disable-next-line:no-console
          console.log(await this.getResponseBody(params.requestId));
        }
      }
    });
  }

  /**
   * show
   */
  public show() {
    this.newWin!.show();
  }

  /**
   * load
   */
  public load(url: string) {
    this.newWin!.loadURL(url);
  }

  private getResponseBody (requestId: string) {
    return new Promise((resolve, reject) => {
      this.newWin!.webContents.debugger.sendCommand('Network.getResponseBody', {
        'requestId': requestId
      }, (error, response) => {
        if (error.code) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}

export default Monitor;
