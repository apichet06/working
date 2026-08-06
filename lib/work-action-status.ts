// สถานะที่เป็นไปได้ทั้งหมดของ WorkingActionJob.wa_status (ดู working-api/src/modules/workingactoinsjob/action.service.ts)
export const WORK_ACTION_STATUS = {
    AUTO_CLOSED: "ระบบปิดงานอัตโนมัติ",
    USER_CLOSED: "ผู้ใช้ปิดงาน",
    ADMIN_EDITED: "แอดมินแก้ไข",
} as const;

type WorkActionStatusStyle = {
    label: string;
    className: string;
};

const DEFAULT_STYLE: WorkActionStatusStyle = {
    label: "-",
    className: "bg-muted text-muted-foreground",
};

const WORK_ACTION_STATUS_STYLES: Record<string, WorkActionStatusStyle> = {
    [WORK_ACTION_STATUS.AUTO_CLOSED]: {
        label: WORK_ACTION_STATUS.AUTO_CLOSED,
        className: "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400",
    },
    [WORK_ACTION_STATUS.USER_CLOSED]: {
        label: WORK_ACTION_STATUS.USER_CLOSED,
        className: "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    [WORK_ACTION_STATUS.ADMIN_EDITED]: {
        label: WORK_ACTION_STATUS.ADMIN_EDITED,
        className: "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400",
    },
};

// จุดกลางเดียวสำหรับ map wa_status -> สี/label ให้ตรงกันทุกที่ที่แสดงสถานะนี้ในเว็บ
export function getWorkActionStatusStyle(status: string | null | undefined): WorkActionStatusStyle {
    if (!status) return DEFAULT_STYLE;
    return WORK_ACTION_STATUS_STYLES[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
}
