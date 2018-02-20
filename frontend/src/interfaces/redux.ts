import { ISearch } from '../interfaces/models';

export interface ISearchReducer {
  searchList: ISearch[];
}

export interface IStore {
  search: ISearchReducer;
}

export interface IAction<P> {
  type: string;
  payload: P;
  meta?: any;
}
