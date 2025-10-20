import {appFetch} from './appFetch';

export const findPokemons = async (querry) =>
    await appFetch('POST', "/pokemon/_search", querry);

export const findPokemonById = async (id) =>
    await appFetch('GET', `/pokemon/_doc/${id}`);

export const findMoves = async (querry) =>
    await appFetch('POST', "/moves/_search", querry);
