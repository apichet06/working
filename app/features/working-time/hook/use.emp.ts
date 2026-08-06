import { useCallback, useEffect, useState } from "react"
import { empDTO } from "../type"
import { workingtime_service } from "../lib/working-time.service"

export function useEmp() {
    const [data, setData] = useState<empDTO[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await workingtime_service.listEmp()
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
    return { data, loading, error, refresh: fetchData }
}