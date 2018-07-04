import Proxy, { IRequestDetail, IResponseDetail } from './Proxy';
const proxy = new Proxy();
proxy.beforeSendRequest = function(requestDetail: IRequestDetail) {
  const id = new Date().getTime().toString();
  requestDetail._req.__request_id = id;
  process.send!({type: 'get-request', data: {id: id, url: requestDetail.url}});
  return null;
};
proxy.beforeSendResponse = function(
  requestDetail: IRequestDetail,
  responseDetail: IResponseDetail
) {
  process.send!({type: 'get-response', data: {id: requestDetail._req.__request_id, detail: responseDetail.response}});
  return null;
};
proxy.on('error', (error: {}) => {
  process.send!({type: 'error', data: error.toString()});
});
proxy.on('connect-error', (error: {}) => {
  process.send!({type: 'connect-error', data: error.toString()});
});
try {
  proxy.start();
} catch (error) {
  process.send!({type: 'error', data: error.toString()});
}
