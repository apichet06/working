// เวลาที่ backend (working-api/src/jobs/autoCloseWorkingAction.ts) ตั้ง cron ปิดงานอัตโนมัติไว้จริง
const AUTO_CLOSE_TIMES = [
    { hour: 11, minute: 45 },
    { hour: 16, minute: 40 },
    { hour: 0, minute: 0 }, // เผื่อพนักงาน OT ที่ทำงานต่อจนดึก
]

// เผื่อให้ backend ปิดงานเสร็จก่อนที่ฝั่งนี้จะ reload
const REFRESH_DELAY_MS = 5000

function getNextAutoCloseRefresh(from: Date): Date {
    const candidates = AUTO_CLOSE_TIMES.map(({ hour, minute }) => {
        const d = new Date(from)
        d.setHours(hour, minute, 0, 0)
        d.setTime(d.getTime() + REFRESH_DELAY_MS)
        if (d.getTime() <= from.getTime()) {
            d.setDate(d.getDate() + 1)
        }
        return d
    })
    return candidates.reduce((earliest, d) => (d < earliest ? d : earliest))
}

// เรียก callback ครั้งเดียวทันทีหลังรอบ auto-close ที่ใกล้ที่สุด (11:45 / 16:40) แล้วตั้งรอบถัดไปให้เองต่อเนื่อง
// แทนที่จะ poll รัวๆ ทุก N วินาที
export function scheduleAutoCloseRefresh(callback: () => void): () => void {
    let timeoutId: ReturnType<typeof setTimeout>

    const scheduleNext = () => {
        const next = getNextAutoCloseRefresh(new Date())
        timeoutId = setTimeout(() => {
            callback()
            scheduleNext()
        }, next.getTime() - Date.now())
    }

    scheduleNext()
    return () => clearTimeout(timeoutId)
}
