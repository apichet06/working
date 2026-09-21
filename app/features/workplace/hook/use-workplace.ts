import { useCallback, useEffect, useState } from "react";
import werkplace_service from "../lib/workplace_service";
import { WorkplaceDTO } from "../type";

export function useWorkplace() {
  const [data, setData] = useState<WorkplaceDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async (options?: { isInitial?: boolean }) => {
    if (options?.isInitial) setLoading(true);

    try {
      const data = await werkplace_service.list();
      setData(data);
    } catch (err) {
      console.error("Failed to fetch workplace data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload({ isInitial: true });
  }, [reload]);

  return {
    data,
    loading,
    reload,
  };
}
