import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { deleteSearch, fetchSearchList } from '../actions/searchActions';
import { ISearch, IImage } from '../interfaces/models';
import { IStore, IAction } from '../interfaces/redux';
import ImageList from './ImageList';

interface IProps {
  searchList: ISearch[];
  match: any;
  deleteSearch: (id: number) => IAction<any>;
  fetchSearchList: () => IAction<any>;
  history: any;
}

export class SearchItem extends Component<IProps, {}> {
  public state = {
    filter: 'none',
    confirmDelete: false,
    deleting: false,
  };

  private handleDelete = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { confirmDelete } = this.state;
    if (!confirmDelete) {
      window.setTimeout(() => {
        this.setState({ confirmDelete: true });
      }, 500);
    } else {
      const { searchList, match } = this.props;
      const { id } = match.params;
      const activeSearch = searchList.find(s => s.id === parseInt(id, 10));

      this.setState({ deleting: true, confirmDelete: false });
      this.props.deleteSearch(activeSearch.id).then(() => {
        this.props.fetchSearchList();
        this.props.history.push('/');
      });
    }
  }

  private handleFilterToggle = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { filter } = this.state;
    if (filter === 'none') {
      this.setState({ filter: 'included' });
    } else if (filter === 'included') {
      this.setState({ filter: 'unknown' });
    } else if (filter === 'unknown') {
      this.setState({ filter: 'excluded' });
    } else {
      this.setState({ filter: 'none' });
    }
  }

  private getImageList = (images: IImage[]) => {
    switch (this.state.filter) {
      case 'included':
        return images.filter(image => image.included);
      case 'excluded':
        return images.filter(image => image.included === false)
      case 'unknown':
        return images.filter(image => image.included === null);
      default:
        return images;
    }
  }

  getDeleteMessage = () => {
    const { confirmDelete, deleting } = this.state;
    if (deleting) {
      return 'Deleting images...';
    } else if (confirmDelete) {
      return 'Are you sure?';
    }
    return 'Delete Images';
  }

  public render(): JSX.Element {
    const { filter } = this.state;
    const { searchList, match } = this.props;
    const { id } = match.params;
    const activeSearch = searchList.find(s => s.id === parseInt(id, 10));
    if (!activeSearch) {
      return <h1>Search not found</h1>;
    }

    const images = this.getImageList(activeSearch.images);
    return (
      <div className="search_item__container">
        <h2>{activeSearch.name} - Image Count: {images.length} - Filter: {filter}</h2>
        <button onClick={this.handleFilterToggle} >Filtered by: {filter}</button>
        <button className="search_item__delete" onClick={this.handleDelete}>
          {this.getDeleteMessage()}
        </button>
        <ImageList images={images} />
      </div>
    );
  }
}

const mapStateToProps = (state: IStore) => ({
  searchList: state.search.searchList,
});

export default withRouter<any>(connect<{}, {}, {}>(mapStateToProps, { deleteSearch, fetchSearchList })(SearchItem));
