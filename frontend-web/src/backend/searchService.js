import {appFetch} from './appFetch';

export const searchElasticSearch = async (index, querry) =>
    await appFetch('POST', `/${index}/_search`, querry);