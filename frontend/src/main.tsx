import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Switch } from "wouter";
import {
  FourOhFourPage,
  OcrPage,
  CsvPage
} from './pages';

const App = () => (
  <Switch>
    <Route path="/ocr" component={OcrPage} />
    <Route path="/csv" component={CsvPage} />

    {/* Default route in a switch */}
    <Route>
      <FourOhFourPage />
    </Route>
  </Switch>
)


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
