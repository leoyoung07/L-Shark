import * as AnyProxy from 'anyproxy';
import { EventEmitter } from 'events';

export interface IRequestOptions {
  hostname: string;
  port: number;
  path: string;
  method: string;
  headers: {};
}

export interface IRequestData {

}

export interface IRequest {
  protocol: string;
  url: string;
  requestOptions: IRequestOptions;
  requestData: IRequestData;
}

export interface IRequestDetail extends IRequest {

  _req: { __request_id?: string };
}

export interface IResponse {
  statusCode: number;
  header: {};
  body: string | Buffer;
  dataType: string;
}

export interface IResponseDetail {
  response: IResponse;
  _req: { __request_id?: string };
}

class Proxy extends EventEmitter {
  // tslint:disable-next-line:no-any
  private proxyServer: any;

  // tslint:disable-next-line:no-any
  constructor(private proxyOptions: any) {
    super();
  }

  /**
   * start
   */
  public start() {
    if (!this.proxyServer) {
      this.proxyServer = new AnyProxy.ProxyServer(this.proxyOptions);
    }
    this.proxyServer.on('ready', () => {
      this.emit('ready');
    });

    this.proxyServer.on('error', (e: Error) => {
      this.emit('error', e);
    });

    this.proxyServer.start();
  }

  /**
   * stop
   */
  public stop() {
    if (this.proxyServer) {
      this.proxyServer.close();
      this.proxyServer = null;
    }
  }

  /**
   * status
   */
  public status() {
    if (this.proxyServer) {
      return this.proxyOptions;
    } else {
      return null;
    }
  }
}

export default Proxy;
