import { useCallback, useEffect, useState } from 'react';
import { useDataVersion, type DataDomain } from '@/store/dataVersion';

interface LiveQueryResult<T> {
  data: T | undefined;
  loading: boolean;
  error: unknown;
  /** Manual refetch — same effect as a version bump, useful right after a mutation you triggered. */
  refetch: () => void;
}

interface SettledState<T> {
  data: T | undefined;
  error: unknown;
  /** Which request produced this state. Compared by reference/value against the current request. */
  forFetcher: unknown;
  forVersion: number;
  forTick: number;
}

/**
 * Fetches through a repository and re-fetches automatically whenever the given data domain's
 * version counter changes (same-tab mutation or cross-tab `storage` event — see store/dataVersion.ts).
 *
 * `fetcher` must be wrapped in useCallback by the caller: its identity is the query key, so a
 * changing filter naturally triggers a refetch. `loading` is *derived* by comparing the settled
 * state against the current request rather than being set at the top of the effect, which avoids
 * the cascading-render pattern (and the React Compiler lint error that flags it).
 */
export function useLiveQuery<T>(domain: DataDomain, fetcher: () => Promise<T>): LiveQueryResult<T> {
  const version = useDataVersion((s) => s[domain]);
  const [manualTick, setManualTick] = useState(0);
  const [settled, setSettled] = useState<SettledState<T>>({
    data: undefined,
    error: null,
    forFetcher: null,
    forVersion: -1,
    forTick: -1,
  });

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((result) => {
        if (!cancelled) {
          setSettled({
            data: result,
            error: null,
            forFetcher: fetcher,
            forVersion: version,
            forTick: manualTick,
          });
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setSettled({
            data: undefined,
            error: e,
            forFetcher: fetcher,
            forVersion: version,
            forTick: manualTick,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher, version, manualTick]);

  const refetch = useCallback(() => setManualTick((t) => t + 1), []);

  const loading =
    settled.forFetcher !== fetcher || settled.forVersion !== version || settled.forTick !== manualTick;

  return { data: settled.data, loading, error: settled.error, refetch };
}
