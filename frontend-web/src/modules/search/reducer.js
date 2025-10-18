import {combineReducers} from 'redux';

import * as actionTypes from './actionTypes';

const initialState = {
    pokemonSearch: null,
};

const pokemonSearch = (state = initialState.pokemonSearch, action) => {

    switch (action.type) {

        case actionTypes.FIND_POKEMONS_COMPLETED:
            return action.pokemonSearch;

        case actionTypes.CLEAR_POKEMON_SEARCH:
            return initialState.pokemonSearch;

        default:
            return state;

    }

}


const reducer = combineReducers({
    pokemonSearch,
});

export default reducer;