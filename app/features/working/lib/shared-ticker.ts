// รวม timer ของทุก WorkingCard ที่ "กำลังทำงาน" ให้ใช้ setInterval ตัวเดียวร่วมกัน
// (แทนที่แต่ละใบจะมี setInterval + visibilitychange/focus listener ของตัวเอง)
// เพราะถ้ามีงานพร้อมกันหลายสิบใบ การมี timer แยกกันคนละตัวจะกิน main thread เยอะ
// โดยเฉพาะเครื่องที่ RAM/CPU จำกัด ทำให้ UI หยุดนิ่งเป็นจังหวะๆ ได้

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

if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", tick)
    window.addEventListener("focus", tick)
}

export function subscribeTick(listener: Listener): () => void {
    listeners.add(listener)
    ensureRunning()
    return () => {
        listeners.delete(listener)
        stopIfIdle()
    }
}
