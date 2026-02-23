import simpleRestProvider from 'ra-data-simple-rest';
import { httpClient } from './httpClient';

const API = `${import.meta.env.VITE_API_URL}/api`;
const base = simpleRestProvider(API, httpClient);

export const dataProvider = {
  ...base,

  async getList(resource: string, params: any) {
    const { page, perPage } = params.pagination ?? { page: 1, perPage: 10 };
    const { field, order } = params.sort ?? { field: 'id', order: 'ASC' };
    const filter = params.filter ?? {};

    const _start = (page - 1) * perPage;
    const _end = page * perPage;

    const qs = new URLSearchParams({
      filter: JSON.stringify(filter),
      _start: String(_start),
      _end: String(_end),
      _sort: field,
      _order: order,
    });

    const url = `${API}/${resource}?${qs.toString()}`;
    const res = await httpClient(url);
    const json = await res.json;

    const cr = res.headers?.get?.('Content-Range');
    const total = cr ? parseInt(cr.split('/').pop() || '0', 10) : (Array.isArray(json) ? json.length : 0);

    return { data: Array.isArray(json) ? json : json?.data ?? [], total };
  },
};
