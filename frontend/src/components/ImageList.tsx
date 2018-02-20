import React from 'react';

import { IImage } from '../interfaces/models';
import ImageTile from './ImageTile';

interface IProps { images: IImage[]; }

const ImageList = ({ images }: IProps) => (
  <div className="image_list__container">
    {images.map(image => <ImageTile key={image.id} image={image} />)}
  </div>
);

export default ImageList;
