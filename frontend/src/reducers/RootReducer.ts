import { combineReducers, Reducer } from 'redux';
import { IStore } from '../interfaces/redux';

import SearchReducer from './SearchReducer';

const rootReducer: Reducer<IStore> = combineReducers({
  search: SearchReducer,
});

export default rootReducer;
