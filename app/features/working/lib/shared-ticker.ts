// รวม timer ของทุก WorkingCard ที่ "กำลังทำงาน" ให้ใช้ setInterval ตัวเดียวร่วมกัน
// (แทนที่แต่ละใบจะมี setInterval ของตัวเอง) เพราะถ้ามีงานพร้อมกันหลายสิบใบ การมี timer
// แยกกันคนละตัวจะกิน main thread เยอะ ทำให้ UI หยุดนิ่งเป็นจังหวะๆ ได้
// (ส่วน visibilitychange/focus ไม่เกี่ยวกับตัวนี้ - แต่ละ subscriber จัดการ correction ของตัวเอง)

type Listener = () => void

const listeners = new Set<Listener>()
let intervalId: ReturnType<typeof setInterval> | null = null

function tick() {
    listeners.forEach((listener) => listener())
}

function ensureRunning() {
    if (intervalId !== null) return
    intervalId = setInterval(tick, 1000)
}

function stopIfIdle() {
    if (listeners.size === 0 && intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
    }
}

export function subscribeTick(listener: Listener): () => void {
    listeners.add(listener)
    ensureRunning()
    return () => {
        listeners.delete(listener)
        stopIfIdle()
    }
}
