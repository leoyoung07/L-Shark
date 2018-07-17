import { ipcRenderer } from 'electron';
import React from 'react';
import Dialog from 'react-uwp/Dialog';
import SplitView, { SplitViewPane } from 'react-uwp/SplitView';
import { getTheme } from 'react-uwp/Theme';
import ProxyStatusView from './ProxyStatusView';
import RequestDetailPanel from './RequestDetailPanel';
import RequestHistoryView, {
  ICapturedRequest,
  ICapturedResponse,
  IRequestData,
  IRequestHistory
} from './RequestHistoryView';

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

const theme = getTheme({
  themeName: 'light'
});
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
    ipcRenderer.on('proxy-ready', (event: Electron.Event, args: {}) => {
      this.setState({
        proxyReady: true,
        proxyStatus: args
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
          <h3 style={theme.typographyStyles!.subTitle}>Status</h3>
          <ProxyStatusView proxyStatus={this.state.proxyStatus} />
          <h3 style={theme.typographyStyles!.subTitle}>Requests</h3>
          <RequestHistoryView
            requestHistory={this.state.requestHistory}
            handleRequestHistoryClick={this.handleRequestHistoryClick}
          />
          <SplitViewPane>
            {this.state.currentRequest ? (
              <RequestDetailPanel
                curReqDetail={curReqDetail}
                curResDetail={curResDetail}
              />
            ) : null}
          </SplitViewPane>
        </SplitView>
        <Dialog defaultShow={!this.state.proxyReady} style={{ zIndex: 1000 }}>
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
