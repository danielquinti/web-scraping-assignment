import {combineReducers} from 'redux';

import app from '../modules/app';
import search from '../modules/search';

const rootReducer = combineReducers({
    app: app.reducer,
    search: search.reducer,
});

export default rootReducer;