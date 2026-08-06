import { useCallback, useState } from "react"
import { WorkingActionJob, WorkingActionsJobList } from "../type"
import { workingtime_service } from "../lib/working-time.service"
import { normalizeDateOnly } from "@/lib/formDatetime"
import { toast } from "@/components/ui/toast"

export function useWorkingTime() {
    const [data, setData] = useState<WorkingActionsJobList[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searched, setSearched] = useState(false)

    const [e_usercode, setEUsercode] = useState("")
    const [w_date, setWDate] = useState(normalizeDateOnly(new Date()))

    const search = useCallback(async () => {
        const usercode = e_usercode.trim()
        if (!usercode) {
            setData([])
            setSearched(true)
            setError("กรุณาระบุรหัสพนักงานเพื่อค้นหา")
            return
        }

        setLoading(true)
        try {
            const res = await workingtime_service.list({ e_usercode: usercode, w_date: w_date || undefined })
            setData(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ")
        } finally {
            setLoading(false)
            setSearched(true)
        }
    }, [e_usercode, w_date])

    const updateWorkingAction = useCallback(async (wa_id: number, input: WorkingActionJob) => {
        await workingtime_service.update(wa_id, input)
        toast.add({ title: "บันทึกข้อมูลสำเร็จ", type: "success" })
        await search()
    }, [search])

    return {
        data,
        loading,
        error,
        searched,
        e_usercode,
        setEUsercode,
        w_date,
        setWDate,
        search,
        refresh: search,
        updateWorkingAction,
    }
}
