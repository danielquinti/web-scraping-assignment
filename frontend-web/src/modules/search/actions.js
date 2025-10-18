import * as actionTypes from './actionTypes';

export const findPokemonsCompleted = pokemonSearch => ({
    type: actionTypes.FIND_POKEMONS_COMPLETED,
    pokemonSearch
});

export const clearPokemonSearch = () => ({
    type: actionTypes.CLEAR_POKEMON_SEARCH
});