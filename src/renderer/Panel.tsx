import { ipcRenderer } from 'electron';
import React from 'react';

interface IPanelProps {

}
interface IPanelState {
  url: string;
  requests: Array<string>;
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
      const request = args as {id: string, url: string};
      const newRequests = this.state.requests.slice();
      newRequests.push(JSON.stringify(request));
      this.setState({
        requests: newRequests
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
              <li key={index} style={{backgroundColor: 'yellow'}}>{request}</li>
            );
          })}
        </ul>
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
