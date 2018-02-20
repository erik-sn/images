/* eslint-disable */
delete process.env.BROWSER;
import 'module-alias/register';

import * as compression from 'compression';
import * as express from 'express';
import * as exphbs from 'express-handlebars';
import * as http from 'http';
import * as logger from 'morgan';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { applyMiddleware, createStore } from 'redux';

// note the dist, not src
import Application from './components/Application';
import reducers from './reducers/RootReducer';

// tslint-ignore-next-line
const VERSION = require('../../package.json').version; // tslint:disable-line

interface IRequest { url: string; }

function generateBody(req: IRequest) {
  const createStoreWithMiddleware = applyMiddleware()(createStore);
  return renderToString(
    <Provider store={createStoreWithMiddleware(reducers)} >
      <StaticRouter location={req.url} context={context} >
        <Application />
      </StaticRouter>
    </Provider>,
  );
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(compression()); // compress compatible files for quicker client load time
app.use(logger('prod')); // log content

// handlebars configuration
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', 'dist');

// Set path to public assets
app.use('/static', express.static('dist'));
app.use('/dist', express.static('dist'));

/**
 * For every request send the URL to React which will execute the first
 * render of our application. We give it the URL from the HTTP request
 * and this is passed to react-router so the correct route will be
 * rendered.
 */
interface IContext { url?: string; }
const context: IContext = {};
app.use('/', (req: IRequest, res: any) => {
  if (context.url) {
    res.writeHead(302, {
      Location: context.url,
    });
    res.end();
  } else {
    const body = generateBody(req);
    const reduxState = JSON.stringify({ hello: 'world' }).replace(/</g, '\\u003c');
    res.render('index', { version: VERSION, body, preloadedState: reduxState });
  }
});

const server = http.createServer(app);
server.listen(PORT);
