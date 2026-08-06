import { MonthlySummaryItem, YearlySummaryItem } from "../type";

export const THAI_MONTH_LABELS = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
] as const;

export type YearChartPoint = {
    month: number;
    label: string;
    total_hours: number;
    job_hour: number;
};

export type MonthChartPoint = {
    day: number;
    label: string;
    total_hours: number;
    job_hour: number;
};

// เติมให้ครบ 12 เดือนของปีนั้นเสมอ เดือนไหนไม่มีข้อมูลจาก API ให้เป็น 0 แทนที่จะขาดหาย
export function buildYearMonths(data: YearlySummaryItem[]): YearChartPoint[] {
    const byMonth = new Map(data.map((item) => [item.month, item]));

    return Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const found = byMonth.get(month);
        return {
            month,
            label: THAI_MONTH_LABELS[i],
            total_hours: found?.total_hours ?? 0,
            job_hour: found?.job_hour ?? 0,
        };
    });
}

// เติมให้ครบทุกวันของเดือนนั้น (28-31 วันตามจริง) วันไหนไม่มีข้อมูลจาก API ให้เป็น 0 แทนที่จะขาดหาย
// เก็บทุกวันไว้ (ไม่ตัดวันที่ไม่มีงานออก) เพราะแกนวันที่ต้องสื่อเวลาต่อเนื่องจริง ไม่งั้นช่องว่างระหว่างวันจะมองไม่เห็น
export function buildMonthDays(year: number, month: number, data: MonthlySummaryItem[]): MonthChartPoint[] {
    const daysInMonth = new Date(year, month, 0).getDate();
    const byDay = new Map(data.map((item) => [item.day, item]));

    return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const found = byDay.get(day);
        return {
            day,
            label: String(day),
            total_hours: found?.total_hours ?? 0,
            job_hour: found?.job_hour ?? 0,
        };
    });
}
