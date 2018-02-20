import * as React from 'react';
import { Link } from 'react-router-dom';

const NotFound = (): JSX.Element => (
  <h1>
    Page not Found - <Link to="/">go back to the home page!</Link>
  </h1>
);

export default NotFound;
