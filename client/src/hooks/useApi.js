import { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "../services/api";

/**
 * useApi — generic fetcher hook
 * @param {Function} apiFn - function that returns a promise (e.g. () => orderService.getMyOrders())
 * @param {any[]} deps - dependency array — refetches when these change
 * @param {Object} options
 * @param {boolean} options.immediate - fetch on mount (default: true)
 */
const useApi = (apiFn, deps = [], options = {}) => {
  const { immediate = true } = options;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError]     = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

  return { data, loading, error, execute, setData };
};

export default useApi;
