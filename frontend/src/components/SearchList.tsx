import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ISearch } from '../interfaces/models';
import { IStore } from '../interfaces/redux';

interface IProps { searchList: ISearch[]; }

const SearchList = ({ searchList }: IProps) => (
  <div className="search_list__container">
    {searchList.map((search) => (
      <div className="search_list__item">
        <Link to={`/search/${search.id}`}>
          {search.name} - {search.images.length}
        </Link>
      </div>
    ))}
  </div>
);

const mapStateToProps = (state: IStore) => ({
  searchList: state.search.searchList,
});

export default connect<IProps, {}, {}>(mapStateToProps)(SearchList);
