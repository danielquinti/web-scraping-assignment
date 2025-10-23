import {appFetch} from './appFetch';

export const findPokemons = async (querry) =>
    await appFetch('POST', "/pokemon/_search", querry);

export const findPokemonById = async (id) =>
    await appFetch('GET', `/pokemon/_doc/${id}`);

export const findMoves = async (querry) =>
    await appFetch('POST', "/moves/_search", querry);

export const findItems = async (querry) =>
    await appFetch('POST', "/objects/_search", querry);

export const findAbilities = async (querry) =>
    await appFetch('POST', "/abilities/_search", querry);
