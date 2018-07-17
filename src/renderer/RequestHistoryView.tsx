import React from 'react';
import ListView from 'react-uwp/ListView';
import { IRequest, IResponse } from '../main/Proxy';
export interface ICapturedRequest {
  id: string;
  detail: IRequest;
}

export interface ICapturedResponse {
  id: string;
  detail: IResponse;
}

export interface IRequestData {
  request: ICapturedRequest;
  pending: boolean;
  response?: ICapturedResponse;
}

export interface IRequestHistory {
  [id: string]: IRequestData;
}

interface IRequestHistoryViewState {}
interface IRequestHistoryViewProps {
  requestHistory: IRequestHistory;
  handleRequestHistoryClick(id: string, e: React.MouseEvent<HTMLElement>): void;
}
class RequestHistoryView extends React.Component<
  IRequestHistoryViewProps,
  IRequestHistoryViewState
> {
  render() {
    return (
      <ListView
        style={{
          margin: 0,
          width: '100%',
          height: '100%',
          overflowX: 'hidden',
          overflowY: 'auto',
          border: 'none'
        }}
        listSource={Object.keys(this.props.requestHistory)
          .sort()
          .map((id, index) => {
            const requestData = this.props.requestHistory[id];
            return (
              <div
                key={id}
                style={{
                  color: requestData.pending ? 'gray' : 'black',
                  cursor: 'pointer'
                }}
                onClick={e => {
                  this.props.handleRequestHistoryClick(id, e);
                }}
              >
                {requestData.request.detail.url}
              </div>
            );
          })}
      />
    );
  }
}

export default RequestHistoryView;
