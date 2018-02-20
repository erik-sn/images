import axios, { AxiosPromise } from 'axios';

import { IAction } from '../interfaces/redux';
import Actions from './Actions';
import { API } from './Types';

export function fetchSearchList(): IAction<AxiosPromise> {
  return {
    type: Actions.FETCH_SEARCHES,
    payload: axios.get(`${API}/searches/`),
  };
}

export function createSearch(name: string, url: string): IAction<AxiosPromise> {
  return {
    type: Actions.CREATE_SEARCH,
    payload: axios.post(`${API}/searches/`, { name, url }),
  };
}

export function deleteSearch(id: number): IAction<AxiosPromise> {
  return {
    type: Actions.DELETE_SEARCH,
    payload: axios.delete(`${API}/searches/${id}/`),
    meta: { id },
  };
}

export function toggleImageIncludes(id: number, value: boolean): IAction<AxiosPromise> {
  let url = `${API}/images/${id}/toggle_includes/`;
  url = value !== null ? `${url}?value=${value}` : url;
  return {
    type: Actions.TOGGLE_IMAGE_INCLUDES,
    payload: axios.put(url),
  };
}
