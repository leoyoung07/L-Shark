import { ipcRenderer } from 'electron';
import React from 'react';
import { IResponseDetail } from '../main/Proxy';
interface IRequest {
  url: string;
  id: string;
  pending: boolean;
}

interface IPanelProps {

}
interface IPanelState {
  url: string;
  requests: Array<IRequest>;
  connectError?: string;
  error?: string;
}
class Panel extends React.Component<IPanelProps, IPanelState> {

  constructor (props: IPanelProps) {
    super(props);
    this.handleUrlInputChange = this.handleUrlInputChange.bind(this);
    this.handleLoadBtnClick = this.handleLoadBtnClick.bind(this);
    this.state = {
      url: 'https://api.github.com',
      requests: []
    };
  }

  componentDidMount() {
    ipcRenderer.on('get-request', (event: Electron.Event, args: {}) => {
      const request = args as IRequest;
      const newRequests = this.state.requests.slice();
      request.pending = true;
      newRequests.push(request);
      this.setState({
        requests: newRequests
      });
    });
    ipcRenderer.on('get-response', (event: Electron.Event, args: {}) => {
      const request = args as {id: string, responseDetail: IResponseDetail};
      const index = this.state.requests.findIndex((value) => value.id === request.id);
      const newRequests = this.state.requests.slice();
      newRequests[index].pending = false;
      this.setState({
        requests: newRequests
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
        <input type="text" value={this.state.url} onChange={this.handleUrlInputChange}/>
        <button onClick={this.handleLoadBtnClick}>Load</button>
        <h1>Requests: </h1>
        <ul>
          {this.state.requests.map((request, index) => {
            return (
              <li key={request.id} style={{backgroundColor: request.pending ? 'red' : 'green'}}>{request.url}</li>
            );
          })}
        </ul>
        <h1>Connect Error</h1>
        <p>{this.state.connectError}</p>
        <h1>Error</h1>
        <p>{this.state.error}</p>
      </div>
    );
  }

  private handleUrlInputChange (e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target) {
      this.setState({
        url: e.target.value
      });
    }
  }

  private handleLoadBtnClick (e: React.MouseEvent<HTMLButtonElement>) {
    ipcRenderer.send('load-url', this.state.url);
  }
}

export default Panel;
