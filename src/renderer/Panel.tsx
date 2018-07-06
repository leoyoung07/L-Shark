import { ipcRenderer } from 'electron';
import React from 'react';
import ListView from 'react-uwp/ListView';
import SplitView, { SplitViewPane } from 'react-uwp/SplitView';
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
      expanded: false
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
                <h3>Request</h3>
                <p>{JSON.stringify(this.state.currentRequest.request)}</p>
                <h3>Response</h3>
                <p>{JSON.stringify(this.state.currentRequest.response)}</p>
              </div>
            ) : null}
          </SplitViewPane>
        </SplitView>
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
