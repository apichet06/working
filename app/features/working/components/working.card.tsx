import { useEffect, useState } from "react"
import { PencilIcon, PlayIcon, CircleStopIcon, Trash2Icon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { cn } from "@/lib/utils"
import { WorkingMaster } from "../type"

type WorkingCardProps = {
    item: WorkingMaster
    onEdit: (item: WorkingMaster) => void
    onDelete: (item: WorkingMaster) => void
    onStart: (w_id: number) => Promise<void>
    onEnd: (wa_id: number) => Promise<void>
}

type ConfirmAction = "start" | "end"

function formatTime(value: string | null): string {
    if (!value) return "-"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
}

function formatDuration(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":")
}

export default function WorkingCard({ item, onEdit, onDelete, onStart, onEnd }: WorkingCardProps) {
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

    const isStarted = !!item.wa_start_job
    const isEnded = !!item.wa_end_job
    const isInProgress = isStarted && !isEnded

    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        if (!isInProgress) return
        const id = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(id)
    }, [isInProgress])

    const elapsedMs = isInProgress && item.wa_start_job ? now - new Date(item.wa_start_job).getTime() : 0

    return (
        <>
            <Card
                className={cn(
                    "flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4",
                    isInProgress && "bg-teal-700/5 ring-teal-500/30"
                )}
            >
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-6 lg:items-center">
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">งาน(Job Code)</p>
                        <p className="truncate font-medium">{item.job_code}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.job_descriptions}</p>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">หมวดหมู่(Category Code)</p>
                        <p className="truncate">{item.cc_code}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.cc_descriptions}</p>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">ชิ้นงาน(Part Code)</p>
                        <p className="truncate">{item.part_code}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.part_descriptions}</p>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">เลขที่โปรเจกต์(Product No)</p>
                        <p className="truncate">{item.w_project_no || "-"}</p>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">รายละเอียด(Detail)</p>
                        <p className="truncate text-muted-foreground">{item.w_desc}</p>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">สถานะ</p>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {!isStarted && <Badge variant="outline">ยังไม่เริ่มงาน</Badge>}
                            {isInProgress && <Badge>กำลังทำงาน</Badge>}
                            {isEnded && <Badge variant="secondary">เสร็จสิ้น</Badge>}
                        </div>
                        {isStarted && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                เริ่ม {formatTime(item.wa_start_job)}
                                {isEnded && ` · จบ ${formatTime(item.wa_end_job)}`}
                            </p>
                        )}
                        {isInProgress && (
                            <p className="mt-0.5 font-mono text-sm font-medium text-teal-600 dark:text-teal-400">
                                {formatDuration(elapsedMs)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-1 sm:justify-start">
                    {!isInProgress && (
                        <Button type="button" size="sm" onClick={() => setConfirmAction("start")}>
                            <PlayIcon />
                            เริ่มงาน
                        </Button>
                    )}
                    {isInProgress && (
                        <Button type="button" size="sm" variant="destructive" onClick={() => setConfirmAction("end")}>
                            <CircleStopIcon />
                            ปิดงาน
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="แก้ไข"
                        onClick={() => onEdit(item)}
                    >
                        <PencilIcon />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="ลบ"
                        onClick={() => onDelete(item)}
                    >
                        <Trash2Icon className="text-destructive" />
                    </Button>
                </div>
            </Card>

            <ConfirmDialog
                open={!!confirmAction}
                onOpenChange={(open) => !open && setConfirmAction(null)}
                title={confirmAction === "start" ? "เริ่มงาน" : "ปิดงาน"}
                description={
                    confirmAction === "start"
                        ? `ต้องการเริ่มงาน "${item.job_code}" ใช่หรือไม่?`
                        : `ต้องการปิดงาน "${item.job_code}" ใช่หรือไม่?`
                }
                confirmLabel={confirmAction === "start" ? "เริ่มงาน" : "ปิดงาน"}
                confirmingLabel={confirmAction === "start" ? "กำลังเริ่มงาน..." : "กำลังปิดงาน..."}
                variant={confirmAction === "start" ? "default" : "destructive"}
                errorTitle={confirmAction === "start" ? "เริ่มงานไม่สำเร็จ" : "ปิดงานไม่สำเร็จ"}
                onConfirm={async () => {
                    if (confirmAction === "start") {
                        await onStart(item.w_id)
                    } else if (confirmAction === "end" && item.wa_id) {
                        await onEnd(item.wa_id)
                    }
                }}
            />
        </>
    )
}
