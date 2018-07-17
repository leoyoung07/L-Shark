import React from 'react';

interface IHeaderState {}
interface IHeaderProps {
  theme: ReactUWP.ThemeType;
}
class Header extends React.Component<IHeaderProps, IHeaderState> {
  render() {
    return (
      <h3 style={this.props.theme.typographyStyles!.title}>
        {this.props.children}
      </h3>
    );
  }
}

export default Header;
