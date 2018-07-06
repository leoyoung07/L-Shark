import React from 'react';
import ReactDOM from 'react-dom';
import { hashHistory, Route, Router } from 'react-router';
import Panel from './Panel';

import './App.scss';

const appRoot = document.getElementById('app');

appRoot.className = 'app';

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={Panel}/>
  </Router>
, appRoot);
