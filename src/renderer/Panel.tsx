import { ipcRenderer } from 'electron';
import React from 'react';
import ListView from 'react-uwp/ListView';
import { getTheme, Theme as UWPThemeProvider } from 'react-uwp/Theme';
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
  [id: string]: {
    request: ICapturedRequest;
    pending: boolean;
    response?: ICapturedResponse;
  };
}

interface IPanelProps {}
interface IPanelState {
  url: string;
  requestHistory: IRequestHistory;
  connectError?: string;
  error?: string;
}
class Panel extends React.Component<IPanelProps, IPanelState> {
  constructor(props: IPanelProps) {
    super(props);
    this.handleUrlInputChange = this.handleUrlInputChange.bind(this);
    this.handleLoadBtnClick = this.handleLoadBtnClick.bind(this);
    this.handleRequestHistoryClick = this.handleRequestHistoryClick.bind(this);
    this.state = {
      url: '',
      requestHistory: {}
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
    return (
      <div>
        <UWPThemeProvider
          theme={getTheme({
            themeName: 'light', // set custom theme
          })}
        >
          <ListView
            listSource={Object.keys(this.state.requestHistory)
              .sort()
              .map((id, index) => {
                const requestData = this.state.requestHistory[id];
                return (
                  <span
                    key={id}
                    style={{
                      color: requestData.pending ? 'red' : 'green',
                      cursor: 'pointer'
                    }}
                    onClick={e => {
                      this.handleRequestHistoryClick(id, e);
                    }}
                  >
                    {requestData.request.detail.url}
                  </span>
                );
              })}
          />
        </UWPThemeProvider>
        <h3>Connect Error</h3>
        <p>{this.state.connectError}</p>
        <h3>Error</h3>
        <p>{this.state.error}</p>
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
    // tslint:disable-next-line:no-console
    console.log(requestData);
  }
}

export default Panel;
