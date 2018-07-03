import Proxy, { IRequestDetail, IResponseDetail } from './Proxy';
const proxy = new Proxy();
proxy.beforeSendRequest = function(requestDetail: IRequestDetail) {
  const id = new Date().getTime().toString();
  requestDetail._req.__request_id = id;
  // window.webContents.send('get-request', {id: id, url: requestDetail.url});
  return null;
};
proxy.beforeSendResponse = function(
  requestDetail: IRequestDetail,
  responseDetail: IResponseDetail
) {
  // window.webContents.send('get-response', {id: requestDetail._req.__request_id, detail: responseDetail});
  return null;
};
proxy.start();
