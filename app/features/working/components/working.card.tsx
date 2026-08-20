import { useEffect, useRef, useState } from "react"
import { PencilIcon, PlayIcon, CircleStopIcon, CheckCircle2Icon, Trash2Icon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/features/login/context/auth-context"
import { shouldUseDieAndMachine } from "../lib/department-rules"
import { subscribeTick } from "../lib/shared-ticker"
import { WorkingMaster } from "../type"

type WorkingCardProps = {
    item: WorkingMaster
    onEdit: (item: WorkingMaster) => void
    onDelete: (item: WorkingMaster) => void
    onStart: (w_id: number) => Promise<void>
    onEnd: (wa_id: number) => Promise<void>
    onFinish: (w_id: number) => Promise<void>
}

type ConfirmAction = "start" | "end" | "finish"

function formatTime(value: string | null): string {
    if (!value) return "-"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
}

function formatDuration(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds))
    const h = Math.floor(safeSeconds / 3600)
    const m = Math.floor((safeSeconds % 3600) / 60)
    const s = safeSeconds % 60
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":")
}

// แยกเป็น component ย่อยเฉพาะตัวเลขที่เดินนาฬิกา เพราะ setElapsedSeconds ทำงานทุก 1 วิ
// ถ้าปล่อยให้ state นี้อยู่ใน WorkingCard ตรงๆ จะ re-render ทั้งการ์ด (ปุ่ม, badge, ข้อมูลงานทั้งหมด)
// ทุกวินาที ทั้งที่มีแค่เลขบรรทัดนี้บรรทัดเดียวที่เปลี่ยน - ถ้ามีการ์ด "กำลังทำงาน" พร้อมกันหลายสิบใบ
// จะกลายเป็น re-render หนักทุกวินาทีโดยไม่จำเป็น
function ElapsedTimeDisplay({ startElapsedSeconds }: { startElapsedSeconds: number }) {
    const [trackedStart, setTrackedStart] = useState(startElapsedSeconds)
    const [elapsedSeconds, setElapsedSeconds] = useState(startElapsedSeconds)
    if (startElapsedSeconds !== trackedStart) {
        setTrackedStart(startElapsedSeconds)
        setElapsedSeconds(startElapsedSeconds)
    }

    // ระหว่าง tab ยัง active/โฟกัสอยู่ ให้เดิน +1 เฉยๆ แบบเดิมสุด (เบาที่สุด ไม่มี overhead เพิ่ม)
    // จะมาคำนวณจากเวลาจริงเทียบกับ anchor ก็ต่อเมื่อกลับมาโฟกัส tab หลังจากสลับไปที่อื่นเท่านั้น
    // เพื่อ "แก้" ตัวเลขให้ถูกครั้งเดียวตอนนั้น (กันปัญหาค้างตอนกลับมาเปิด tab)
    const anchorRef = useRef<{ base: number; time: number } | null>(null)
    useEffect(() => {
        anchorRef.current = { base: elapsedSeconds, time: Date.now() }
    }, [elapsedSeconds])

    useEffect(() => {
        const tick = () => setElapsedSeconds((prev) => prev + 1)
        return subscribeTick(tick)
    }, [])

    useEffect(() => {
        const correctFromRealTime = () => {
            const anchor = anchorRef.current
            if (!anchor) return
            setElapsedSeconds(anchor.base + Math.floor((Date.now() - anchor.time) / 1000))
        }
        document.addEventListener("visibilitychange", correctFromRealTime)
        window.addEventListener("focus", correctFromRealTime)
        return () => {
            document.removeEventListener("visibilitychange", correctFromRealTime)
            window.removeEventListener("focus", correctFromRealTime)
        }
    }, [])

    return (
        <p className="mt-0.5 font-mono text-sm font-medium text-teal-600 dark:text-teal-400">
            {formatDuration(elapsedSeconds)}
        </p>
    )
}

export default function WorkingCard({ item, onEdit, onDelete, onStart, onEnd, onFinish }: WorkingCardProps) {
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
    const { user } = useAuth()
    const showMachineCode = shouldUseDieAndMachine(user?.d_id)

    const isStarted = !!item.wa_start_job
    const isEnded = !!item.wa_end_job
    const isInProgress = isStarted && !isEnded

    return (
        <>
            <Card
                className={cn(
                    "flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4",
                    isInProgress && "bg-teal-700/5 ring-teal-500/30"
                )}
            >
                <div className={cn(
                    "grid min-w-0 flex-1 grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3 lg:items-center",
                    showMachineCode ? "lg:grid-cols-7" : "lg:grid-cols-6"
                )}>
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">เลขที่โปรเจกต์(Product No)</p>
                        <p className="truncate">{item.w_project_no || "-"}</p>
                        {item.die_descriptions && (
                            <p className="truncate text-xs text-muted-foreground">{item.die_descriptions}</p>
                        )}
                    </div>
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
                    {showMachineCode && (
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">เครื่องจักร(Machine Code)</p>
                            <p className="truncate">{item.mac_code ?? "-"}</p>
                            <p className="truncate text-xs text-muted-foreground">{item.mac_descriptions}</p>
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">รายละเอียด(Detail)</p>
                        {item.w_desc ? (
                            <Tooltip>
                                <TooltipTrigger render={<p className="truncate text-muted-foreground">{item.w_desc}</p>} />
                                <TooltipContent>{item.w_desc}</TooltipContent>
                            </Tooltip>
                        ) : (
                            <p className="truncate text-muted-foreground">{item.w_desc}</p>
                        )}
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
                            <ElapsedTimeDisplay startElapsedSeconds={item.elapsed_seconds ?? 0} />
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
                            หยุดชั่วคราว
                        </Button>
                    )}
                    <Button type="button" size="sm" variant="outline" disabled={!isStarted} onClick={() => setConfirmAction("finish")}>
                        <CheckCircle2Icon />
                        จบงาน
                    </Button>
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
                title={confirmAction === "start" ? "เริ่มงาน" : confirmAction === "end" ? "ปิดงาน" : "จบงาน"}
                description={
                    confirmAction === "start"
                        ? `ต้องการเริ่มงาน "${item.job_code}" ใช่หรือไม่?`
                        : confirmAction === "end"
                            ? `ต้องการปิดงาน "${item.job_code}" ใช่หรือไม่?`
                            : isInProgress
                                ? `ต้องการจบงาน "${item.job_code}" ใช่หรือไม่? ระบบจะปิดเวลาที่กำลังนับให้อัตโนมัติ และงานนี้จะหายไปจากรายการ`
                                : `ต้องการจบงาน "${item.job_code}" ใช่หรือไม่? งานนี้จะหายไปจากรายการ`
                }
                confirmLabel={confirmAction === "start" ? "เริ่มงาน" : confirmAction === "end" ? "ปิดงาน" : "จบงาน"}
                confirmingLabel={confirmAction === "start" ? "กำลังเริ่มงาน..." : confirmAction === "end" ? "กำลังปิดงาน..." : "กำลังจบงาน..."}
                variant={confirmAction === "start" ? "default" : "destructive"}
                errorTitle={confirmAction === "start" ? "เริ่มงานไม่สำเร็จ" : confirmAction === "end" ? "ปิดงานไม่สำเร็จ" : "จบงานไม่สำเร็จ"}
                onConfirm={async () => {
                    if (confirmAction === "start") {
                        await onStart(item.w_id)
                    } else if (confirmAction === "end" && item.wa_id) {
                        await onEnd(item.wa_id)
                    } else if (confirmAction === "finish") {
                        await onFinish(item.w_id)
                    }
                }}
            />
        </>
    )
}
