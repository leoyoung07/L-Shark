import * as AnyProxy from 'anyproxy';
import { EventEmitter } from 'events';

export interface IRequestDetail {
  protocol: string;
  url: string;
  requestOptions: {
    hostname: string;
    port: number;
    path: string;
    method: string;
    headers: {};
  };
  requestData: {};
  _req: { __request_id?: string };
}

export interface IResponseDetail {
  response: {
    statusCode: number;
    header: {};
    body: string | Buffer;
  };
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
}

export default Proxy;
