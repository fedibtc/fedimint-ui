// from react-router-dom examples
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useQuery = () => {
  const { search } = useLocation();

  // return () => new URLSearchParams(search);
  return useMemo(() => new URLSearchParams(search), [search]);
};
