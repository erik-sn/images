import React, { Component } from 'react';
import { connect } from 'react-redux';

import { IImage } from '../interfaces/models';
import { toggleImageIncludes } from '../actions/searchActions';
import Card from './Card';

interface IProps { image: IImage; toggleImageIncludes?: (id: number, value: boolean) => void; }

class ImageTile extends Component<IProps, {}> {
  private handleLeftClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.props.toggleImageIncludes(this.props.image.id, true);
  }

  private handleRightClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.props.toggleImageIncludes(this.props.image.id, false);
  }


  private getClassName = () => {
    const { image } = this.props;
    const base = 'search_item__image';
    if (image.included === false) {
      return `${base} search_item__excluded`;
    } else if (image.included === true) {
      return `${base} search_item__included`;
    }
    return `${base} search_item__unknown`;
  }

  public render(): JSX.Element {
    const { image } = this.props;
    const imgLink = `http://localhost:8000${image.filePath.replace('/project', '')}`;
    return (
      <Card>
        <div className={this.getClassName()}>
          <button onClick={this.handleLeftClick} onContextMenu={this.handleRightClick} >
            <img src={imgLink} />
          </button>
          <a className="search_item__link" href={image.imgUrl} target="_blank" >link</a>
        </div>
      </Card>
    );
  }
}

export default connect<IProps, {}, {}>(null, { toggleImageIncludes })(ImageTile);
