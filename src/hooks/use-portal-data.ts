"use client";

import { useCallback, useEffect, useState } from "react";
import { loadPortalData, type PortalDataView } from "@/server/actions/portal-data";

export function usePortalData<T>(view: PortalDataView, id?: string, childId?: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    loadPortalData({ view, id, childId }).then((result) => {
      if (!active) return;
      if (result.ok) {
        setData(result.data as T);
        setError(null);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    }).catch((cause: unknown) => {
      if (!active) return;
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu");
      setIsLoading(false);
    });
    return () => { active = false; };
  }, [view, id, childId, version]);

  return { data, error, isLoading, refresh };
}
