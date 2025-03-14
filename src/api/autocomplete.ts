import { api } from './interceptor';
import { TAutocomplete } from '../types/autocomplete';

export const autocomplete = async (): Promise<TAutocomplete[]> => {
  const response = await api.get(`/autocomplete`);
  return response.data;
};
