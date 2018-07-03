import React from 'react';
import ReactDOM from 'react-dom';
import { hashHistory, Route, Router } from 'react-router';
import Panel from './Panel';

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={Panel}/>
  </Router>
, document.getElementById('app'));
