'use client'
import { useMemo, useState } from 'react'
import { useWorkingTime } from '@/app/features/working-time/hook/use.working-time'
import WorkingTimeTable from '@/app/features/working-time/components/working-time-table'
import WorkingTimeForm from '@/app/features/working-time/components/working-time-form'
import { useAuth } from '@/app/features/login/context/auth-context'
import { WorkingActionJob, WorkingActionsJobList } from '@/app/features/working-time/type'
import { WorkingTimeFormValues } from '@/app/features/working-time/lib/working-time.schema'
import { combineDateAndTime } from '@/lib/formDatetime'
import { useEmp } from '@/app/features/working-time/hook/use.emp'
import { WorkActionStatusBadge } from '@/components/work-action-status-badge'
import { WORK_ACTION_STATUS } from '@/lib/work-action-status'

export default function WorkingTime() {
    const {
        data,
        loading,
        error,
        searched,
        e_usercode,
        setEUsercode,
        w_date,
        setWDate,
        search,
        updateWorkingAction,
    } = useWorkingTime()
    const { user } = useAuth()
    const { data: empData } = useEmp()
    const empOptions = useMemo(
        () => empData.map((emp) => ({ value: emp.e_usercode, label: `${emp.e_usercode} - ${emp.e_fullname_th}` })),
        [empData]
    )
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<WorkingActionsJobList | null>(null)

    const handleEdit = (row: WorkingActionsJobList) => {
        setEditing(row)
        setFormOpen(true)
    }

    const handleFormSubmit = async (values: WorkingTimeFormValues) => {
        if (!editing) return

        const input: WorkingActionJob = {
            wa_id: editing.wa_id,
            wa_start_job: combineDateAndTime(editing.working_date, values.wa_start_time),
            wa_end_job: combineDateAndTime(editing.working_date, values.wa_end_time),
            wa_status: editing.wa_status,
            e_id: editing.e_id,
            w_id: editing.w_id,
            user_edit: user?.e_id ?? editing.user_edit,
            edit_date: new Date().toISOString(),
        }

        await updateWorkingAction(editing.wa_id, input)
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-xl font-semibold">Working Time (ปรับแก้เวลา)</h1>
                <p className="text-sm text-muted-foreground">
                    ค้นหารายการลงเวลาทำงานตามรหัสพนักงานและวันที่ เพื่อแก้ไขเวลาเริ่มงานและเวลาสิ้นสุดงาน
                </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="mb-2 font-medium">ความหมายของสถานะ</p>
                <ul className="flex flex-col gap-2">
                    <li className="flex items-start gap-2">
                        <WorkActionStatusBadge status={WORK_ACTION_STATUS.USER_CLOSED} />
                        <span className="text-muted-foreground">พนักงานกดปิดงานเอง เวลาถูกต้องตามที่ทำงานจริง</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <WorkActionStatusBadge status={WORK_ACTION_STATUS.AUTO_CLOSED} />
                        <span className="text-muted-foreground">
                            พนักงานลืมกดปิดงาน ระบบเลยปิดงานให้อัตโนมัติตามรอบเวลาที่กำหนดไว้ (11:45, 16:40 และเที่ยงคืนสำหรับคนทำ OT)
                            เวลาที่ได้จึงอาจไม่ตรงกับเวลาที่เลิกงานจริง ควรตรวจสอบและแก้ไขเวลาให้ถูกต้อง
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <WorkActionStatusBadge status={WORK_ACTION_STATUS.ADMIN_EDITED} />
                        <span className="text-muted-foreground">แอดมินเข้ามาปรับแก้เวลาทำงานให้แล้ว</span>
                    </li>
                </ul>
            </div>

            <WorkingTimeTable
                data={data}
                loading={loading}
                error={error}
                searched={searched}
                e_usercode={e_usercode}
                onEUsercodeChange={setEUsercode}
                empOptions={empOptions}
                w_date={w_date}
                onWDateChange={setWDate}
                onSearch={search}
                onEdit={handleEdit}
            />

            <WorkingTimeForm
                open={formOpen}
                onOpenChange={setFormOpen}
                workingAction={editing}
                onSubmit={handleFormSubmit}
            />
        </div>
    )
}
