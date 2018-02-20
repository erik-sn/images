/* eslint-disable no-underscore-dangle */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { applyMiddleware, createStore } from 'redux';
import ReduxPromise from 'redux-promise';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/fn/set';
import 'core-js/es6/promise';
import 'core-js/fn/string/includes';
import 'core-js/fn/string/starts-with';
import 'core-js/fn/array/find';
import 'core-js/fn/array/from';
import raf from 'raf';

import './styles/app.scss';
import Application from './components/Application';
import rootReducer from './reducers/RootReducer';

declare var window: any;
/* polyfills for react support */
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = raf;
}
window.React = React;

const createStoreWithMiddleware = applyMiddleware(ReduxPromise)(createStore);

const store = createStoreWithMiddleware(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

ReactDOM.render(
  <Provider store={store}>
    <Router >
      <Application />
    </Router>
  </Provider>,
  document.getElementById('app-container'),
);
