import { useCallback, useEffect, useState } from "react";
import { DetailMaster, DetailMasterInput } from "../type";
import { toast } from "@/components/ui/toast";
import { detailmaster_service } from "../lib/detail_service";

export function useDetailMaster() {
    const [data, setData] = useState<DetailMaster[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await detailmaster_service.list()
            setData(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount; state only updates after the awaited request settles
        fetchData()
    }, [fetchData])

    const createDetailMaster = useCallback(async (input: DetailMasterInput) => {
        await detailmaster_service.create(input)
        toast.add({ title: "บันทึกข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const updateDetailMaster = useCallback(async (detail_id: number, input: DetailMasterInput) => {
        await detailmaster_service.update(detail_id, input)
        toast.add({ title: "อัปเดตข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const deleteDetailMaster = useCallback(async (detail_id: number) => {
        await detailmaster_service.remove(detail_id)
        toast.add({ title: "ลบข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        createDetailMaster,
        updateDetailMaster,
        deleteDetailMaster,
    }
}
