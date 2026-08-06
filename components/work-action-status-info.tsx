"use client"

import { InfoIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { WorkActionStatusBadge } from "@/components/work-action-status-badge"
import { WORK_ACTION_STATUS } from "@/lib/work-action-status"

export function WorkActionStatusInfo() {
    return (
        <Popover>
            <PopoverTrigger
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label="คำอธิบายสถานะ"
            >
                <InfoIcon className="size-4" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
                <p className="mb-2 text-sm font-medium">ความหมายของสถานะ</p>
                <ul className="flex flex-col gap-2 text-sm">
                    <li className="flex items-start gap-2">
                        <WorkActionStatusBadge status={WORK_ACTION_STATUS.USER_CLOSED} className="mt-0.5" />
                        <span className="text-muted-foreground">พนักงานกดปิดงานเอง เวลาถูกต้องตามที่ทำงานจริง</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <WorkActionStatusBadge status={WORK_ACTION_STATUS.AUTO_CLOSED} className="mt-0.5" />
                        <span className="text-muted-foreground">
                            พนักงานลืมกดปิดงาน ระบบเลยปิดให้อัตโนมัติตามรอบเวลา (11:45, 16:40 และเที่ยงคืนสำหรับคนทำ OT)
                            เวลาที่ได้อาจไม่ตรงกับเวลาเลิกงานจริง ควรตรวจสอบและแก้ไข
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <WorkActionStatusBadge status={WORK_ACTION_STATUS.ADMIN_EDITED} className="mt-0.5" />
                        <span className="text-muted-foreground">แอดมินเข้ามาปรับแก้เวลาทำงานให้แล้ว</span>
                    </li>
                </ul>
            </PopoverContent>
        </Popover>
    )
}
