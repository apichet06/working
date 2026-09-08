import { useCallback, useEffect, useRef, useState } from "react"
import { format, isSameDay, startOfDay, subDays } from "date-fns"
import { th } from "date-fns/locale"
import { PencilIcon, PlayIcon, CircleStopIcon, CheckCircle2Icon, Trash2Icon, ClockIcon, CalendarIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "@/components/ui/toast"
import { parseApiError } from "@/lib/parse-api-error"
import { combineDateAndTime, toMySQLDateTime } from "@/lib/formDatetime"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/features/login/context/auth-context"
import { shouldUseDieAndMachine, shouldUseManualTimeEntry } from "../lib/department-rules"
import { getManualTimeEntrySchema } from "../lib/working.schema"
import { subscribeTick } from "../lib/shared-ticker"
import { WorkingMaster } from "../type"

type WorkingCardProps = {
    item: WorkingMaster
    onEdit: (item: WorkingMaster) => void
    onDelete: (item: WorkingMaster) => void
    onStart: (w_id: number) => Promise<void>
    onEnd: (wa_id: number) => Promise<void>
    onFinish: (w_id: number) => Promise<void>
    onLogManualTime: (w_id: number, wa_start_job: string, wa_end_job: string) => Promise<void>
    isRecentlyLogged?: boolean
}

type ConfirmAction = "start" | "end" | "finish"
type ManualTimeEntryField = "work_date" | "wa_start_time" | "wa_end_time"

function formatTime(value: string | null): string {
    if (!value) return "-"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
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
    const [elapsedSeconds, setElapsedSeconds] = useState(startElapsedSeconds)
    // anchor นี้ต้องคงที่ตลอดอายุ component ห้ามเลื่อนตาม tick เพราะ browser อาจ throttle
    // setInterval ตอน tab ไม่ active หากบวกทีละ 1 แล้วเลื่อน anchor เวลาที่ callback ไม่ได้ทำงานจะหายไปถาวร
    const anchorRef = useRef<{ base: number; time: number } | null>(null)

    const calculateElapsed = useCallback(() => {
        const anchor = anchorRef.current
        if (!anchor) return startElapsedSeconds
        return anchor.base + Math.floor((Date.now() - anchor.time) / 1000)
    }, [startElapsedSeconds])

    useEffect(() => {
        anchorRef.current = { base: startElapsedSeconds, time: Date.now() }
        // tick มีหน้าที่ขอ render เท่านั้น ค่าที่แสดงคำนวณจากเวลาจริงทุกครั้ง
        // ต่อให้ callback หายไปหลายนาที ครั้งถัดไปก็จะกระโดดมาค่าที่ถูกต้องทันที
        const tick = () => setElapsedSeconds(calculateElapsed())
        return subscribeTick(tick)
    }, [calculateElapsed, startElapsedSeconds])

    useEffect(() => {
        const correctFromRealTime = () => {
            if (document.visibilityState !== "visible") return
            setElapsedSeconds(calculateElapsed())
        }
        document.addEventListener("visibilitychange", correctFromRealTime)
        window.addEventListener("focus", correctFromRealTime)
        return () => {
            document.removeEventListener("visibilitychange", correctFromRealTime)
            window.removeEventListener("focus", correctFromRealTime)
        }
    }, [calculateElapsed])

    return (
        <p className="mt-0.5 font-mono text-sm font-medium text-teal-600 dark:text-teal-400">
            {formatDuration(elapsedSeconds)}
        </p>
    )
}

// แผนกที่ระบุเวลาเริ่ม/จบเอง (ดู shouldUseManualTimeEntry) - popover เล็กๆ แทนปุ่มเริ่มงาน/หยุดชั่วคราว
// ให้กรอกเวลาทั้งสองช่องแล้วบันทึกพร้อมกันทีเดียว แทนการจับเวลาสด
function ManualTimeEntryPopover({
    jobCode,
    onSubmit,
}: {
    jobCode: string
    onSubmit: (wa_start_job: string, wa_end_job: string) => Promise<void>
}) {
    const [open, setOpen] = useState(false)
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [workDate, setWorkDate] = useState<Date | undefined>()
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<ManualTimeEntryField, string>>>({})

    const clearFieldError = (field: ManualTimeEntryField) => {
        setFieldErrors((current) => {
            if (!current[field]) return current
            return { ...current, [field]: undefined }
        })
    }

    const handleSubmit = async () => {
        const now = new Date()
        const nowTime = now.toTimeString().slice(0, 5)
        const isToday = !!workDate && isSameDay(workDate, now)
        const result = getManualTimeEntrySchema(nowTime, isToday).safeParse({
            work_date: workDate,
            wa_start_time: startTime,
            wa_end_time: endTime,
        })

        if (!result.success) {
            const nextErrors: Partial<Record<ManualTimeEntryField, string>> = {}
            for (const issue of result.error.issues) {
                const field = issue.path[0]
                if (
                    typeof field === "string" &&
                    (field === "work_date" || field === "wa_start_time" || field === "wa_end_time") &&
                    !nextErrors[field]
                ) {
                    nextErrors[field] = issue.message
                }
            }
            setFieldErrors(nextErrors)
            return
        }

        setFieldErrors({})
        setSubmitting(true)
        try {
            await onSubmit(
                toMySQLDateTime(combineDateAndTime(result.data.work_date, result.data.wa_start_time)),
                toMySQLDateTime(combineDateAndTime(result.data.work_date, result.data.wa_end_time)),
            )
            setOpen(false)
            setWorkDate(undefined)
            setStartTime("")
            setEndTime("")
        } catch (err) {
            toast.add({
                title: "บันทึกเวลาไม่สำเร็จ",
                description: parseApiError(err, "บันทึกเวลาไม่สำเร็จ"),
                type: "error",
            })
        } finally {
            setSubmitting(false)
        }
    }

    const today = startOfDay(new Date())
    const earliestAllowedDate = subDays(today, 6)

    return (
        <Popover open={open} onOpenChange={(next) => !submitting && setOpen(next)}>
            <PopoverTrigger
                render={
                    <Button type="button" size="sm">
                        <ClockIcon />
                        เวลา(เริ่ม/หยุด)งาน
                    </Button>
                }
            />
            <PopoverContent align="end" className="w-64">
                <p className="text-sm font-medium">ระบุเวลาสำหรับ &quot;{jobCode}&quot;</p>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                        <label htmlFor={`manual-work-date-${jobCode}`} className="text-xs text-muted-foreground">วันที่ทำงาน</label>
                        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                            <PopoverTrigger
                                render={
                                    <Button
                                        id={`manual-work-date-${jobCode}`}
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={submitting}
                                        aria-invalid={!!fieldErrors.work_date}
                                        className={cn(
                                            "w-full justify-start font-normal",
                                            !workDate && "text-muted-foreground",
                                        )}
                                    >
                                        <CalendarIcon />
                                        {workDate ? format(workDate, "dd/MM/yyyy") : "กรุณาเลือกวันที่"}
                                    </Button>
                                }
                            />
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    locale={th}
                                    selected={workDate}
                                    defaultMonth={workDate ?? today}
                                    startMonth={earliestAllowedDate}
                                    endMonth={today}
                                    disabled={{ before: earliestAllowedDate, after: today }}
                                    onSelect={(date) => {
                                        setWorkDate(date)
                                        if (date) {
                                            clearFieldError("work_date")
                                            setDatePickerOpen(false)
                                        }
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        {fieldErrors.work_date && (
                            <p className="text-xs text-destructive">{fieldErrors.work_date}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">เวลาเริ่ม</label>
                        <Input
                            type="time"
                            value={startTime}
                            disabled={submitting}
                            aria-invalid={!!fieldErrors.wa_start_time}
                            onChange={(e) => {
                                setStartTime(e.target.value)
                                clearFieldError("wa_start_time")
                            }}
                        />
                        {fieldErrors.wa_start_time && (
                            <p className="text-xs text-destructive">{fieldErrors.wa_start_time}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">เวลาหยุด</label>
                        <Input
                            type="time"
                            value={endTime}
                            disabled={submitting}
                            aria-invalid={!!fieldErrors.wa_end_time}
                            onChange={(e) => {
                                setEndTime(e.target.value)
                                clearFieldError("wa_end_time")
                            }}
                        />
                        {fieldErrors.wa_end_time && (
                            <p className="text-xs text-destructive">{fieldErrors.wa_end_time}</p>
                        )}
                    </div>
                </div>
                <Button type="button" size="sm" className="w-full" disabled={submitting} onClick={handleSubmit}>
                    {submitting ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
            </PopoverContent>
        </Popover>
    )
}

export default function WorkingCard({ item, onEdit, onDelete, onStart, onEnd, onFinish, onLogManualTime, isRecentlyLogged }: WorkingCardProps) {
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
    const { user } = useAuth()
    const showMachineCode = shouldUseDieAndMachine(user?.d_id)
    const useManualEntry = shouldUseManualTimeEntry(user?.d_id)

    const isStarted = !!item.wa_start_job
    const isEnded = !!item.wa_end_job
    const isInProgress = isStarted && !isEnded

    return (
        <>
            <Card
                className={cn(
                    "flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4",
                    isInProgress && "bg-teal-700/5 ring-teal-500/30",
                    isRecentlyLogged && "bg-amber-500/5 ring-2 ring-amber-500/40 transition-colors duration-1000"
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
                            <ElapsedTimeDisplay
                                key={`${item.wa_id}:${item.elapsed_seconds ?? 0}`}
                                startElapsedSeconds={item.elapsed_seconds ?? 0}
                            />
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-1 sm:justify-start">
                    {useManualEntry ? (
                        <ManualTimeEntryPopover
                            jobCode={item.job_code}
                            onSubmit={(wa_start_job, wa_end_job) => onLogManualTime(item.w_id, wa_start_job, wa_end_job)}
                        />
                    ) : (
                        <>
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
                        </>
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
                        disabled={isEnded}
                        onClick={() => onEdit(item)}
                    >
                        <PencilIcon />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="ลบ"
                        disabled={!!item.wa_id}
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
