import React from 'react';

export interface IProps { children: JSX.Element; }

const Card = ({ children }: IProps) => (
  <div className="card__container">
    {children}
  </div>
);

export default Card;
