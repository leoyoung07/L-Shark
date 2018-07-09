import Proxy, { IRequestDetail, IResponseDetail } from './Proxy';
import Util from './Util';

const proxyRule = {
  summary: 'default',
  beforeSendRequest: function*(requestDetail: IRequestDetail) {
    const id = Util.GenUniqueId();
    requestDetail._req.__request_id = id;
    process.send!({
      type: 'get-request',
      data: {
        id: id,
        detail: {
          url: requestDetail.url,
          protocol: requestDetail.protocol,
          requestOptions: requestDetail.requestOptions,
          requestData: requestDetail.requestData
        }
      }
    });
    return null;
  },
  // 发送响应前处理
  beforeSendResponse: function*(
    requestDetail: IRequestDetail,
    responseDetail: IResponseDetail
  ) {
    const response = responseDetail.response;
    response.body = response.body.toString();
    process.send!({
      type: 'get-response',
      data: {
        id: requestDetail._req.__request_id,
        detail: {
          body: response.body,
          header: response.header,
          statusCode: response.statusCode
        }
      }
    });
    return null;
  },
  // 是否处理https请求
  *beforeDealHttpsRequest(requestDetail: IRequestDetail) {
    return Promise.resolve(true);
  },
  // 请求出错的事件
  *onError(requestDetail: IRequestDetail, error: {}) {
    process.send!({ type: 'error', data: error.toString() });
    return null;
  },
  // https连接服务器出错
  *onConnectError(requestDetail: IRequestDetail, error: {}) {
    process.send!({ type: 'connect-error', data: error.toString() });
    return null;
  }
};

const proxyOptions = {
  port: 7269,
  rule: proxyRule,
  webInterface: {
    enable: true,
    webPort: 7270
  },
  // throttle: 10000,
  forceProxyHttps: true,
  wsIntercept: false, // 不开启websocket代理
  silent: false
};

const proxy = new Proxy(proxyOptions);

try {
  proxy.start();
} catch (error) {
  process.send!({ type: 'error', data: error.toString() });
}
