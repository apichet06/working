"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Calendar from "@fullcalendar/react"
import listPlugin from "@fullcalendar/react/list"
import classicThemePlugin from "@fullcalendar/react/themes/classic"
import thLocale from "@fullcalendar/react/locales/th"
import type { EventInput, EventSourceFuncInfo, EventDisplayInfo, CalendarRef, ListDayHeaderInfo } from "@fullcalendar/react"

import "@fullcalendar/react/skeleton.css"
import "@fullcalendar/react/themes/classic/theme.css"
import "@fullcalendar/react/themes/classic/palette.css"

import { Badge } from "@/components/ui/badge"
import { WorkActionStatusBadge } from "@/components/work-action-status-badge"
import { working_service } from "../lib/working.service"
import { scheduleAutoCloseRefresh } from "../lib/auto-close-schedule"
import { UseHoliday } from "../hook/use.horiday"
import { parseApiError } from "@/lib/parse-api-error"

function toDateStr(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

// วันหยุดเก็บเป็น ISO UTC string (เช่น "2026-12-26T17:00:00.000Z" = เที่ยงคืนไทยของวันที่ 27)
// ถ้าส่ง string นี้ตรงๆ ให้ FullCalendar เป็น allDay event มันจะตีความตาม timezone ของ
// browser เอง ซึ่งไม่ชัวร์ว่าตรงกับเวลาไทยเป๊ะ เลยแปลงเป็นวันที่ไทยแบบ fix +7 ชม. เอง
// ก่อนส่งให้ FullCalendar กันเพี้ยน
// dayOffset ไว้ใช้ตอนแปลง h_end_date: ค่านี้คือวันสุดท้ายของวันหยุดแบบนับรวม (inclusive)
// แต่ FullCalendar ต้องการ end แบบ exclusive (วันถัดจากวันสุดท้าย) เลยต้อง +1 วัน
function toBangkokDateStr(iso: string, dayOffset = 0): string {
    const bangkokMs = new Date(iso).getTime() + 7 * 60 * 60 * 1000 + dayOffset * 24 * 60 * 60 * 1000
    const d = new Date(bangkokMs)
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, "0")
    const day = String(d.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

// เดินหน้าทีละวันแบบ UTC ล้วนๆ (ไม่พึ่ง timezone ของ browser) กันวันเพี้ยนเวลาบวกวัน
function addDaysToDateStr(dateStr: string, days: number): string {
    const [y, m, d] = dateStr.split("-").map(Number)
    const next = new Date(Date.UTC(y, m - 1, d) + days * 24 * 60 * 60 * 1000)
    return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`
}

// h_holiday_status ที่เจอจริงจาก EIS: "SAT"/"SUN" = วันหยุดประจำสัปดาห์, "TRADITIONA(L)" = วันหยุดตามประเพณี
function isTraditionalHoliday(status: string): boolean {
    return status.toUpperCase().includes("TRADITION")
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
    if (event.extendedProps.isHoliday) {
        return (
            <div className="flex flex-col gap-0.5 py-0.5">
                <span className="text-sm font-medium">{event.title}</span>
                <Badge variant="outline">วันหยุด</Badge>
            </div>
        )
    }

    const isEnded = !!event.end
    const waStatus = event.extendedProps.wa_status as string | null

    return (
        <div className="flex flex-col gap-0.5 py-0.5">
            <span className="text-sm font-medium">{event.title}</span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant={isEnded ? "secondary" : "default"}>
                    {isEnded ? "เสร็จสิ้น" : "กำลังทำงาน"}
                </Badge>
                {isEnded && waStatus && <WorkActionStatusBadge status={waStatus} />}
                <span>
                    เริ่ม {formatTime(event.start)}
                    {isEnded && ` · จบ ${formatTime(event.end)}`}
                    {isEnded && event.start && event.end && ` · วันทำงาน ${formatJobHours(event.start, event.end)} วัน | · ใช้เวลาทำงาน ${formatLabourHours(event.start, event.end)} ชม.`}
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
    const { data: holidays } = UseHoliday()

    // แม็ป "วันที่ไทย" (string) -> h_holiday_status ของแต่ละวันหยุด ไว้ใช้ทาสีบาร์หัววันในมุมมองลิสต์
    const holidayStatusByDate = useMemo(() => {
        const map = new Map<string, string>()
        for (const h of holidays) {
            const startStr = toBangkokDateStr(h.h_start_date)
            const endStr = toBangkokDateStr(h.h_end_date)
            let cursor = startStr
            for (let i = 0; i < 366 && cursor <= endStr; i++) {
                map.set(cursor, h.h_holiday_status)
                cursor = addDaysToDateStr(cursor, 1)
            }
        }
        return map
    }, [holidays])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- gates FullCalendar's first real mount past React Strict Mode's double-invoke pass, which @fullcalendar/react v7 mishandles
        setMounted(true)
    }, [])

    useEffect(() => {
        // เผื่อกรณีระบบปิดงานอัตโนมัติ (cron 11:45 / 16:40 / 00:00) ตอนที่หน้านี้เปิดค้างอยู่ - refetch ครั้งเดียวหลังรอบ auto-close แต่ละครั้ง
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
                // วันหยุด (allDay) ต้องอยู่หน้าสุดของแต่ละวันเสมอ ไม่งั้น default sort ("start,...")
                // อาจเอางานที่มีเวลาเริ่มก่อนเที่ยงคืนพอดี (edge case) ขึ้นก่อนวันหยุดได้
                eventOrder="-allDay,start"
                locale={thLocale}
                height={280}
                noEventsText="ไม่มีงานที่บันทึกในสัปดาห์นี้"
                displayEventTime={false}
                eventContent={renderEventContent}
                listDayHeaderClass={(info: ListDayHeaderInfo) => {
                    const status = holidayStatusByDate.get(toDateStr(info.date))
                    if (!status) return ""
                    // ต้องใช้สีทึบ (ไม่มี /opacity) เพราะแถวนี้ sticky อยู่ - พึ่งพื้นหลังทึบเพื่อบัง
                    // content ที่เลื่อนลอดใต้มัน สีโปร่งแสงจะโปร่งทะลุให้เห็นซ้อนกับ event แถวแรก
                    return isTraditionalHoliday(status)
                        ? "bg-amber-200!"
                        : "bg-emerald-200!"
                }}
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
                        const workEvents: EventInput[] = rows.map((item) => ({
                            id: String(item.wa_id),
                            title: `${item.job_code} - ${item.job_descriptions}, ${item.w_project_no} - ${item.die_descriptions} , ${item.w_desc}`,
                            start: item.wa_start_job,
                            end: item.wa_end_job ?? undefined,
                            extendedProps: { wa_status: item.wa_status },
                        }))

                        // เทียบเป็น "วันที่ไทย" ล้วนๆ (string) ทั้งสองฝั่ง กันปัญหา timezone ตอนเทียบช่วงทับกัน
                        // (ถ้าเทียบ raw UTC instant ตรงๆ กับ info.start/info.end ที่เป็น local date ของ
                        // browser จะพลาดวันหยุดที่ขอบเขตพอดีเป๊ะ เช่น h_end_date ตรงกับ info.start เป๊ะ)
                        const viewStart = toDateStr(info.start)
                        const viewEnd = toDateStr(info.end)

                        // เอาเฉพาะวันหยุดที่ทับกับช่วงสัปดาห์ที่กำลังแสดงอยู่
                        const holidayEvents: EventInput[] = holidays
                            .map((h) => ({
                                id: `holiday-${h.h_id}`,
                                title: h.h_name,
                                start: toBangkokDateStr(h.h_start_date),
                                end: toBangkokDateStr(h.h_end_date, 1),
                                allDay: true,
                                extendedProps: { isHoliday: true },
                            }))
                            .filter((h) => h.start < viewEnd && h.end > viewStart)

                        return [...holidayEvents, ...workEvents]
                    } catch (err) {
                        throw new Error(parseApiError(err, "โหลดข้อมูลงานไม่สำเร็จ"))
                    }
                }}
            />
        </div>
    )
}
