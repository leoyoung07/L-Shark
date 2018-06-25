import { ipcRenderer } from 'electron';
import React from 'react';

interface IPanelProps {

}
interface IPanelState {
  url: string;
  response: string;
}
class Panel extends React.Component<IPanelProps, IPanelState> {

  constructor (props: IPanelProps) {
    super(props);
    this.handleUrlInputChange = this.handleUrlInputChange.bind(this);
    this.handleLoadBtnClick = this.handleLoadBtnClick.bind(this);
    this.state = {
      url: 'https://api.github.com',
      response: ''
    };
  }

  componentDidMount() {
    ipcRenderer.on('url-loaded', (event: Electron.Event, args: string) => {
      this.setState({
        response: args
      });
    });
  }

  render() {
    return (
      <div>
        <input type="text" value={this.state.url} onChange={this.handleUrlInputChange}/>
        <button onClick={this.handleLoadBtnClick}>Load</button>
        <h1>Response: </h1>
        <p>{this.state.response}</p>
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
