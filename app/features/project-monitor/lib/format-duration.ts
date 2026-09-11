export function getDurationParts(totalSeconds: number) {
    const totalMinutes = Math.floor(Math.max(0, totalSeconds) / 60)
    const totalHours = Math.floor(totalMinutes / 60)
    return {
        days: Math.floor(totalHours / 24),
        hours: totalHours % 24,
        minutes: totalMinutes % 60,
    }
}

export function formatElapsed(totalSeconds: number): string {
    const { days, hours, minutes } = getDurationParts(totalSeconds)
    return days > 0
        ? `${days} วัน ${hours} ชม. ${minutes} น.`
        : `${hours} ชม. ${minutes} น.`
}
