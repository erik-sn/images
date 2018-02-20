import * as React from 'react';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader';
import { Switch, Route, withRouter } from 'react-router-dom';

import { fetchSearchList } from '../actions/searchActions';
import GenerateSearch from './GenerateSearch';
import SearchList from './SearchList';
import SearchItem from './SearchItem';
import Nav from './Nav';
import NotFound from './NotFound';

interface IProps { fetchSearchList: () => void; }

export class Application extends React.Component<IProps, {}> {
  public componentDidMount() {
    this.props.fetchSearchList();
  }

  public render() {
    return (
      <div className="application__container">
        <Nav />
        <div className="application__content">
          <Switch>
            <Route path="/" exact component={SearchList} />
            <Route path="/search/:id" component={SearchItem} />
            <Route path="/generate" component={GenerateSearch} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default hot(module)(withRouter<any>(connect<{}, {}, {}>(null, { fetchSearchList })(Application)));
