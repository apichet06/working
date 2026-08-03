"use client"

import { useEffect, useRef, useState } from "react"
import Calendar from "@fullcalendar/react"
import listPlugin from "@fullcalendar/react/list"
import classicThemePlugin from "@fullcalendar/react/themes/classic"
import thLocale from "@fullcalendar/react/locales/th"
import type { EventInput, EventSourceFuncInfo, EventDisplayInfo, CalendarRef } from "@fullcalendar/react"

import "@fullcalendar/react/skeleton.css"
import "@fullcalendar/react/themes/classic/theme.css"
import "@fullcalendar/react/themes/classic/palette.css"

import { Badge } from "@/components/ui/badge"
import { working_service } from "../lib/working.service"
import { scheduleAutoCloseRefresh } from "../lib/auto-close-schedule"
import { parseApiError } from "@/lib/parse-api-error"

function toDateStr(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

function formatTime(d: Date | null): string {
    if (!d) return "-"
    return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
}

function formatLabourHours(start: Date, end: Date): string {
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return hours.toFixed(2)
}

function formatJobHours(start: Date, end: Date): string {
    const jobHour = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    return jobHour.toFixed(2)
}

// FullCalendar's scroller class name is a CSS-module hash, so it isn't safe
// to target by className — find it by the actual overflow behavior instead.
function findScroller(root: HTMLElement): HTMLElement | null {
    for (const el of Array.from(root.querySelectorAll<HTMLElement>("div"))) {
        const overflowY = getComputedStyle(el).overflowY
        if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
            return el
        }
    }
    return null
}

// A single requestAnimationFrame isn't reliable: on a fast client-side nav
// (data already warm) the rows can still be a render or two away, so the
// scroller's scrollHeight measured too early is shorter than the final
// content. Keep re-snapping to the bottom on every DOM mutation until
// things stop changing for a bit, then stop watching.
function stickToBottomUntilSettled(root: HTMLElement) {
    let settleTimer: ReturnType<typeof setTimeout>

    const snapToBottom = () => {
        const scroller = findScroller(root)
        if (scroller) scroller.scrollTop = scroller.scrollHeight
    }

    const observer = new MutationObserver(() => {
        snapToBottom()
        clearTimeout(settleTimer)
        settleTimer = setTimeout(() => observer.disconnect(), 150)
    })

    observer.observe(root, { childList: true, subtree: true })
    snapToBottom()
    settleTimer = setTimeout(() => observer.disconnect(), 150)
}

// FullCalendar's built-in list-view time text collapses start/end into a
// single stamp when both round to the same displayed minute (e.g. a job
// started and ended 20s apart) — render the time/status ourselves so a
// completed action's end time is never silently dropped.
function renderEventContent({ event }: EventDisplayInfo) {
    const isEnded = !!event.end
    const waStatus = event.extendedProps.wa_status as string | null

    return (
        <div className="flex flex-col gap-0.5 py-0.5">
            <span className="text-sm font-medium">{event.title}</span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant={isEnded ? "secondary" : "default"}>
                    {isEnded ? "เสร็จสิ้น" : "กำลังทำงาน"}
                </Badge>
                {isEnded && waStatus && <span>({waStatus})</span>}
                <span>
                    เริ่ม {formatTime(event.start)}
                    {isEnded && ` · จบ ${formatTime(event.end)}`}
                    {isEnded && event.start && event.end && ` · วันทำงาน ${formatJobHours(event.start, event.end)} ชม. | · ใช้เวลาทำงาน ${formatLabourHours(event.start, event.end)} ชม.`}
                </span>
            </div>
        </div>
    )
}

export default function WorkingWeekCalendar() {
    const [mounted, setMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const hasScrolledRef = useRef(false)
    const calendarRef = useRef<CalendarRef>(null)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- gates FullCalendar's first real mount past React Strict Mode's double-invoke pass, which @fullcalendar/react v7 mishandles
        setMounted(true)
    }, [])

    useEffect(() => {
        // เผื่อกรณีระบบปิดงานอัตโนมัติ (cron 11:45 / 16:40) ตอนที่หน้านี้เปิดค้างอยู่ - refetch ครั้งเดียวหลังรอบ auto-close แต่ละครั้ง
        return scheduleAutoCloseRefresh(() => {
            calendarRef.current?.getApi().refetchEvents()
        })
    }, [])

    if (!mounted) return null

    return (
        <div className="rounded-md border p-2" ref={containerRef}>
            <Calendar
                ref={calendarRef}
                plugins={[listPlugin, classicThemePlugin]}
                initialView="listWeek"
                headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
                locale={thLocale}
                height={280}
                noEventsText="ไม่มีงานที่บันทึกในสัปดาห์นี้"
                displayEventTime={false}
                eventContent={renderEventContent}
                loading={(isLoading) => {
                    if (isLoading || hasScrolledRef.current || !containerRef.current) return
                    hasScrolledRef.current = true
                    stickToBottomUntilSettled(containerRef.current)
                }}
                events={async (info: EventSourceFuncInfo): Promise<EventInput[]> => {
                    const from = toDateStr(info.start)
                    const to = toDateStr(new Date(info.end.getTime() - 86400000))

                    try {
                        const rows = await working_service.listCalendar(from, to)
                        return rows.map((item) => ({
                            id: String(item.wa_id),
                            title: `${item.job_code} - ${item.job_descriptions} , ${item.w_desc}`,
                            start: item.wa_start_job,
                            end: item.wa_end_job ?? undefined,
                            extendedProps: { wa_status: item.wa_status },
                        }))
                    } catch (err) {
                        throw new Error(parseApiError(err, "โหลดข้อมูลงานไม่สำเร็จ"))
                    }
                }}
            />
        </div>
    )
}
