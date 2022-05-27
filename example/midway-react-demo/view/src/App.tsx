import { Route, Switch } from 'react-router-dom';
import React from 'react';
import About from './pages/About';
import Home from './pages/Home';

export function App() {
  return (
    <Switch>
      <Route path="/about">
        <About />
      </Route>

      <Route path="/">
        <Home />
      </Route>
    </Switch>
  );
}
