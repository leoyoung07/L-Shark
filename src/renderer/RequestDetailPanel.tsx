import React from 'react';
import ListView from 'react-uwp/ListView';
import Tabs, { Tab } from 'react-uwp/Tabs';
import { IRequest, IResponse } from '../main/Proxy';
import ResponseDetailView from './ResponseDetailView';

interface IRequestDetailPanelState {}
interface IRequestDetailPanelProps {
  curReqDetail?: IRequest;
  curResDetail?: IResponse;
}

class RequestDetailPanel extends React.Component<
  IRequestDetailPanelProps,
  IRequestDetailPanelState
> {
  render() {
    return (
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
                this.props.curReqDetail
                  ? [
                      this.props.curReqDetail.protocol,
                      this.props.curReqDetail.requestData,
                      this.props.curReqDetail.requestOptions,
                      this.props.curReqDetail.url
                    ]
                  : []
              }
            />
          </Tab>
          <Tab title="Response">
            <ListView
              listSource={
                this.props.curResDetail
                  ? [
                      this.props.curResDetail.statusCode,
                      this.props.curResDetail.header
                    ]
                  : []
              }
            />
            <ResponseDetailView detail={this.props.curResDetail} />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default RequestDetailPanel;
