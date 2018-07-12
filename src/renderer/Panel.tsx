import { ipcRenderer } from 'electron';
import React from 'react';
import Dialog from 'react-uwp/Dialog';
import ListView from 'react-uwp/ListView';
import SplitView, { SplitViewPane } from 'react-uwp/SplitView';
import Tabs, { Tab } from 'react-uwp/Tabs';
import { IRequest, IResponse } from '../main/Proxy';
interface ICapturedRequest {
  id: string;
  detail: IRequest;
}

interface ICapturedResponse {
  id: string;
  detail: IResponse;
}

interface IRequestHistory {
  [id: string]: IRequestData;
}

interface IRequestData {
  request: ICapturedRequest;
  pending: boolean;
  response?: ICapturedResponse;
}

interface IPanelProps {}
interface IPanelState {
  url: string;
  requestHistory: IRequestHistory;
  connectError?: string;
  error?: string;
  expanded: boolean;
  currentRequest?: IRequestData;
  proxyReady: boolean;
  // tslint:disable-next-line:no-any
  proxyStatus: any;
}
class Panel extends React.Component<IPanelProps, IPanelState> {
  constructor(props: IPanelProps) {
    super(props);
    this.handleUrlInputChange = this.handleUrlInputChange.bind(this);
    this.handleLoadBtnClick = this.handleLoadBtnClick.bind(this);
    this.handleRequestHistoryClick = this.handleRequestHistoryClick.bind(this);
    this.state = {
      url: '',
      requestHistory: {},
      expanded: false,
      proxyReady: false,
      proxyStatus: null
    };
  }

  componentDidMount() {
    ipcRenderer.on('get-request', (event: Electron.Event, args: {}) => {
      const request = args as ICapturedRequest;
      const requestHistory = Object.assign({}, this.state.requestHistory);
      requestHistory[request.id] = { request: request, pending: true };
      this.setState({
        requestHistory: requestHistory
      });
    });
    ipcRenderer.on('get-response', (event: Electron.Event, args: {}) => {
      const response = args as ICapturedResponse;
      const requestHistory = Object.assign({}, this.state.requestHistory);
      const requestData = requestHistory[response.id];
      requestData.pending = false;
      requestData.response = response;
      this.setState({
        requestHistory: requestHistory
      });
    });
    ipcRenderer.on('proxy-ready', (event: Electron.Event) => {
      this.setState({
        proxyReady: true
      });
    });

    ipcRenderer.on('connect-error', (event: Electron.Event, args: {}) => {
      this.setState({
        connectError: JSON.stringify(args)
      });
    });
    ipcRenderer.on('error', (event: Electron.Event, args: {}) => {
      this.setState({
        error: JSON.stringify(args)
      });
    });
  }

  render() {
    const baseStyle: React.CSSProperties = {
      margin: 0,
      width: '100%',
      height: '100%'
    };
    let curReqDetail;
    let curResDetail;
    if (this.state.currentRequest) {
      curReqDetail = this.state.currentRequest.request.detail;
      if (this.state.currentRequest.response) {
        curResDetail = this.state.currentRequest.response.detail;
      }
    }

    const ResponseDetailView = (props: { detail?: IResponse }) => {
      if (props.detail) {
        if (props.detail.dataType === 'image') {
          return (
            <img
              src={('data:image/png;base64,' + props.detail.body) as string}
            />
          );
        } else {
          return <div>{props.detail.body}</div>;
        }
      } else {
        return null;
      }
    };

    return (
      <div style={baseStyle}>
        <SplitView
          defaultExpanded={this.state.expanded}
          displayMode="overlay"
          onClosePane={() => {
            this.setState({ expanded: false });
          }}
          style={baseStyle}
          expandedWidth={500}
        >
          <div>
            <p>{
              this.state.proxyStatus ? JSON.stringify(this.state.proxyStatus) : ''
            }</p>
          </div>
          <ListView
            style={{
              margin: 0,
              width: '100%',
              height: '100%',
              overflowX: 'hidden',
              overflowY: 'auto'
            }}
            listSource={Object.keys(this.state.requestHistory)
              .sort()
              .map((id, index) => {
                const requestData = this.state.requestHistory[id];
                return (
                  <div
                    key={id}
                    style={{
                      color: requestData.pending ? 'gray' : 'black',
                      cursor: 'pointer'
                    }}
                    onClick={e => {
                      this.handleRequestHistoryClick(id, e);
                    }}
                  >
                    {requestData.request.detail.url}
                  </div>
                );
              })}
          />
          <SplitViewPane>
            {this.state.currentRequest ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '10px',
                  overflowX: 'hidden',
                  overflowY: 'auto'
                }}
              >
                <Tabs>
                  <Tab title="Request">
                    <ListView
                      listSource={
                        curReqDetail
                          ? [
                              curReqDetail.protocol,
                              curReqDetail.requestData,
                              curReqDetail.requestOptions,
                              curReqDetail.url
                            ]
                          : []
                      }
                    />
                  </Tab>
                  <Tab title="Response">
                    <ListView
                      listSource={
                        curResDetail
                          ? [curResDetail.statusCode, curResDetail.header]
                          : []
                      }
                    />
                    <ResponseDetailView detail={curResDetail} />
                  </Tab>
                </Tabs>
              </div>
            ) : null}
          </SplitViewPane>
        </SplitView>
        <Dialog
          defaultShow={!this.state.proxyReady}
          style={{ zIndex: 1000 }}
        >
          Proxy is starting up...
        </Dialog>
      </div>
    );
  }

  private handleUrlInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target) {
      this.setState({
        url: e.target.value
      });
    }
  }

  private handleLoadBtnClick(e: React.MouseEvent<HTMLButtonElement>) {
    ipcRenderer.send('load-url', this.state.url);
  }

  private handleRequestHistoryClick(
    id: string,
    e: React.MouseEvent<HTMLElement>
  ) {
    const requestData = this.state.requestHistory[id];
    this.setState({ expanded: true, currentRequest: requestData });
  }
}

export default Panel;
