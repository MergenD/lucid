import { useQuery } from '@tanstack/react-query';
import { autocomplete } from '../api/autocomplete';

export const useAutocompleteQuery = () => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['autocomplete'],
    queryFn: () => autocomplete(),
  });

  return {
    isLoading,
    error,
    data,
    refetch,
  };
};
