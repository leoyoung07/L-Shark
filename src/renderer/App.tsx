import React from 'react';
import ReactDOM from 'react-dom';
import { hashHistory, Link, Route, Router } from 'react-router';
import NavigationView from 'react-uwp/NavigationView';
import SplitViewCommand from 'react-uwp/SplitViewCommand';
import { getTheme, Theme as UWPThemeProvider } from 'react-uwp/Theme';
import Panel from './Panel';

import './App.scss';

const appRoot = document.getElementById('app');

appRoot.className = 'app';

const baseStyle: React.CSSProperties = {
  margin: 0,
  width: '100%',
  height: '100%'
};

const navTo = path => {
  hashHistory.push(path);
};

const navigationTopNodes = [
  <SplitViewCommand
    className="app__split-view"
    key={0}
    label="Home"
    icon={'\uE80F'}
    onClick={e => {
      navTo('/');
    }}
  />
];

const navigationBottomNode = [
  <SplitViewCommand
    className="app__split-view"
    key={0}
    label="Settings"
    icon={'\uE713'}
    onClick={e => {
      navTo('/settings');
    }}
  />
];

ReactDOM.render(
  <UWPThemeProvider
    theme={getTheme({
      themeName: 'light' // set custom theme
    })}
  >
    <NavigationView
      style={baseStyle}
      pageTitle="L-Shark"
      displayMode="compact"
      autoResize={false}
      initWidth={48}
      navigationTopNodes={navigationTopNodes}
      navigationBottomNodes={navigationBottomNode}
    >
      <Router history={hashHistory}>
        <Route path="/" component={Panel} />
      </Router>
    </NavigationView>
  </UWPThemeProvider>,

  appRoot
);
