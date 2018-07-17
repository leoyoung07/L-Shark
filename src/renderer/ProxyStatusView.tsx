import React from 'react';
import ListView from 'react-uwp/ListView';

interface IProxyStatusViewState {}

interface IProxyStatusViewProps {
  // tslint:disable-next-line:no-any
  proxyStatus?: any;
}
class ProxyStatusView extends React.Component<IProxyStatusViewProps, IProxyStatusViewState> {
  render() {
    return this.props.proxyStatus ? (
      <ListView
        style={{
          margin: 0,
          width: '100%',
          border: 'none'
        }}
        listSource={Object.keys(this.props.proxyStatus)
          .sort()
          .map((key, index) => {
            return (
              <span key={key}>
                <span>{key}</span>
                <span style={{ float: 'right' }}>
                  {JSON.stringify(this.props.proxyStatus[key])}
                </span>
              </span>
            );
          })}
      />
    ) : null;
  }
}

export default ProxyStatusView;
