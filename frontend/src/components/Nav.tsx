import * as React from 'react';
import { NavLink } from 'react-router-dom';

const Nav = (): JSX.Element => (
  <nav className="nav__container">
    <div className="nav__item">
      <NavLink to="/" exact activeClassName="nav__selected">Home</NavLink>
    </div>
    <div className="nav__item">
      <NavLink to="/generate" activeClassName="nav__selected">Generate Image Category</NavLink>
    </div>
  </nav>
);

export default Nav;
