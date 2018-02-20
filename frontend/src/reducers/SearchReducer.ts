import Actions from '../actions/Actions';
import { IAction, ISearchReducer } from '../interfaces/redux';

export const initialState: ISearchReducer = {
  searchList: [],
};

export default (state: ISearchReducer = initialState, action: IAction<any>): ISearchReducer => {
  switch (action.type) {
    case Actions.FETCH_SEARCHES: {
      return {
        ...state,
        searchList: action.payload.data,
      };
    }
    case Actions.CREATE_SEARCH: {
      return {
        ...state,
        searchList: state.searchList.concat([action.payload.data]),
      };
    }
    case Actions.DELETE_SEARCH: {
      return {
        ...state,
        // searchList: state.searchList.filter(s => s.id !== action.meta.id),
      };
    }
    case Actions.TOGGLE_IMAGE_INCLUDES: {
      const { id } = action.payload.data;
      const searchList = state.searchList.find(s => s.images.some(i => i.id === id));
      const updatedImages = searchList.images.map(i => i.id === id ? action.payload.data : i);
      searchList.images = updatedImages;
      return {
        ...state,
        searchList: state.searchList.map(s => s.id === searchList.id ? searchList : s),
      };
    }
    default:
      return state;
  }
};
