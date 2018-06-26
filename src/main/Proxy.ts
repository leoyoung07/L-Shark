import * as AnyProxy from 'anyproxy';

const proxyRule = {
  summary: 'proxy',
  *beforeSendRequest(requestDetail: { url: string }) {
    return null;
  },
  // 发送响应前处理
  *beforeSendResponse(
    requestDetail: { url: string },
    responseDetail: { response: string }
  ) {
    return null;
  },
  // 是否处理https请求
  *beforeDealHttpsRequest(requestDetail: {}) {
    return false;
  },
  // 请求出错的事件
  *onError(requestDetail: {}, error: {}) {
    return null;
  },
  // https连接服务器出错
  *onConnectError(requestDetail: {}, error: {}) {
    return null;
  }
};
class Proxy {
  // tslint:disable-next-line:no-any
  private proxyServer: any;
  constructor() {
    const options = {
      port: 7269,
      rule: proxyRule,
      webInterface: {
        enable: true,
        webPort: 7270
      },
      throttle: 10000,
      forceProxyHttps: false,
      wsIntercept: false, // 不开启websocket代理
      silent: false
    };
    this.proxyServer = new AnyProxy.ProxyServer(options);
  }

  /**
   * start
   */
  public start() {
    this.proxyServer.start();
  }
}

export default Proxy;
