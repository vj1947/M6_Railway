// Load data for a page.
//   const { data, meta, error, loading, reload } = useApi(() => api.get('/bookings/my'), []);
import { useCallback, useEffect, useState } from 'react';

export function useApi(request, deps = []) {
  const [state, setState] = useState({ data: null, meta: null, error: null, loading: true });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(request, deps);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data, meta } = await run();
      setState({ data, meta, error: null, loading: false });
    } catch (error) {
      setState({ data: null, meta: null, error, loading: false });
    }
  }, [run]);

  useEffect(() => { load(); }, [load]);

  return { ...state, reload: load };
}
