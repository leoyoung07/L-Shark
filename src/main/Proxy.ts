import * as AnyProxy from 'anyproxy';

export interface IRequestDetail {
  protocol: string;
  url: string;
  requestOptions: {
    hostname: string,
    port: number,
    path: string,
    method: string,
    headers: {}
  };
  requestData: {};
  _req: { __request_id?: string };
}

export interface IResponseDetail {
  response: {
    statusCode: number,
    header: {},
    body: string | Buffer
  };
  _req: { __request_id?: string };
}

type RequestHook = (
  requestDetail: IRequestDetail
) => Promise<{}> | {} | null;

type ResponseHook = (
  requestDetail: IRequestDetail,
  responseDetail: IResponseDetail
) => Promise<{}> | {} | null;

class Proxy {
  public beforeSendRequest: RequestHook | null = null;

  public beforeSendResponse: ResponseHook | null = null;

  // tslint:disable-next-line:no-any
  private proxyServer: any;

  // tslint:disable-next-line:no-any
  private proxyOptions: any;

  constructor() {

    const proxyRule = {
      summary: 'proxy',
      beforeSendRequest: this.beforeSendRequestWrapper.bind(this),
      // 发送响应前处理
      beforeSendResponse: this.beforeSendResponseWrapper.bind(this),
      // 是否处理https请求
      *beforeDealHttpsRequest(requestDetail: IRequestDetail) {
        return true;
      },
      // 请求出错的事件
      *onError(requestDetail: IRequestDetail, error: {}) {
        return null;
      },
      // https连接服务器出错
      *onConnectError(requestDetail: IRequestDetail, error: {}) {
        return null;
      }
    };

    this.proxyOptions = {
      port: 7269,
      rule: proxyRule,
      webInterface: {
        enable: true,
        webPort: 7270
      },
      throttle: 10000,
      forceProxyHttps: true,
      wsIntercept: false, // 不开启websocket代理
      silent: false
    };
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

  private *beforeSendRequestWrapper (requestDetail: IRequestDetail) {
    if (this.beforeSendRequest) {
      return this.beforeSendRequest(requestDetail);
    }
    return null;
  }

  private *beforeSendResponseWrapper (
    requestDetail: IRequestDetail,
    responseDetail: IResponseDetail
  ) {
    if (this.beforeSendResponse) {
      return this.beforeSendResponse(requestDetail, responseDetail);
    }
    return null;
  }
}

export default Proxy;
