"use client";

import { useCallback, useEffect, useState } from "react";
import { loadPortalData, type PortalDataView } from "@/server/actions/portal-data";

export function usePortalData<T>(view: PortalDataView, id?: string, childId?: string) {
  const [result, setResult] = useState<{ key: string; data: T | null; error: string | null } | null>(null);
  const [version, setVersion] = useState(0);
  const requestKey = JSON.stringify([view, id, childId, version]);

  const refresh = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    loadPortalData({ view, id, childId }).then((result) => {
      if (!active) return;
      if (result.ok) {
        setResult({ key: requestKey, data: result.data as T, error: null });
      } else {
        setResult({ key: requestKey, data: null, error: result.error });
      }
    }).catch((cause: unknown) => {
      if (!active) return;
      setResult({ key: requestKey, data: null, error: cause instanceof Error ? cause.message : "Không thể tải dữ liệu" });
    });
    return () => { active = false; };
  }, [view, id, childId, requestKey]);

  const hasResult = result?.key === requestKey;
  return {
    data: hasResult ? result.data : null,
    error: hasResult ? result.error : null,
    isLoading: !hasResult,
    refresh,
  };
}
