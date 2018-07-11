import iconv from 'iconv-lite';
import Proxy, { IRequestDetail, IResponseDetail } from './Proxy';
import Util from './Util';

const proxyRule = {
  summary: 'default',
  beforeSendRequest: function*(requestDetail: IRequestDetail) {
    const id = Util.GenUniqueId();
    requestDetail._req.__request_id = id;
    sendMessageToParent({
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
    // tslint:disable-next-line:no-any
    const resHeader: any = response.header;
    let bodyContent = response.body as Buffer;
    const headerStr = JSON.stringify(resHeader);
    const charsetMatch = headerStr.match(/charset='?([a-zA-Z0-9-]+)'?/);
    const contentType = resHeader && (resHeader['content-type'] || resHeader['Content-Type']);
    let dataType;

    if (charsetMatch && charsetMatch.length) {
      const currentCharset = charsetMatch[1].toLowerCase();
      if (currentCharset !== 'utf-8' && iconv.encodingExists(currentCharset)) {
        response.body = iconv.decode(bodyContent, currentCharset);
      }
      dataType = contentType && /application\/json/i.test(contentType) ? 'json' : 'text';
      response.body = bodyContent.toString();
    } else if (contentType && /image/i.test(contentType)) {
      dataType = 'image';
      response.body = bodyContent.toString('base64');
    } else {
      dataType = contentType;
      response.body = bodyContent.toString();
    }
    sendMessageToParent({
      type: 'get-response',
      data: {
        id: requestDetail._req.__request_id,
        detail: {
          body: response.body,
          header: response.header,
          statusCode: response.statusCode,
          dataType: dataType
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
    sendMessageToParent({ type: 'error', data: error.toString() });
    return null;
  },
  // https连接服务器出错
  *onConnectError(requestDetail: IRequestDetail, error: {}) {
    sendMessageToParent({ type: 'connect-error', data: error.toString() });
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

function sendMessageToParent(msg: {type: string, data?: {} | string}) {
  if (process && process.send) {
    process.send(msg);
  }
}

const proxy = new Proxy(proxyOptions);

proxy.on('ready', () => {
  sendMessageToParent({type: 'ready'});
});

try {
  proxy.start();
} catch (error) {
  sendMessageToParent({ type: 'error', data: error.toString() });
}
