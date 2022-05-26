import React from 'react';
import ReactDOMServer from 'react-dom/server';
import type { StaticContext } from 'react-router';
import { StaticRouter } from 'react-router-dom';
import { App } from './App';

export function render(url: string, _manifest: string, context: StaticContext) {
  return [
    ReactDOMServer.renderToString(
      <StaticRouter location={url} context={context}>
        <App />
      </StaticRouter>
    ),
    '<!--preload-links-->',
  ];
}
