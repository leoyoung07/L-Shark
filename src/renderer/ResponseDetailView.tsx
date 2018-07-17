import React from 'react';
import { IResponse } from '../main/Proxy';

interface IResponseDetailViewState {}

interface IResponseDetailViewProps {
  detail?: IResponse;
}
class ResponseDetailView extends React.Component<
  IResponseDetailViewProps,
  IResponseDetailViewState
> {
  render() {
    if (this.props.detail) {
      if (this.props.detail.dataType === 'image') {
        return (
          <img
            src={('data:image/png;base64,' + this.props.detail.body) as string}
          />
        );
      } else {
        return <div>{this.props.detail.body}</div>;
      }
    } else {
      return null;
    }
  }
}

export default ResponseDetailView;
