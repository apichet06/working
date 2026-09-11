"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, Clock3, RadioTower, RefreshCw } from "lucide-react"
import { ActiveProjectChart } from "./active-project-chart"
import { ProjectMembersDialog } from "./project-members-dialog"
import { ProjectMonitorMode, useProjectMonitor } from "../hook/use-project-monitor"
import { useDepartment } from "@/app/features/dashboard/hook/use.department"
import { useProjectMonitorDepartments } from "../hook/use-project-monitor-departments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/app/features/login/context/auth-context"
import { shouldUseManualTimeEntry } from "@/app/features/working/lib/department-rules"

type SelectedProject = {
    projectNo: string
    mode: ProjectMonitorMode
} | null

export function ProjectMonitorScreen() {
    const { role, user } = useAuth()
    const canViewOtherDepartments = role === "admin" || role === "subadmin"
    const { data: departments, loading: loadingDepartments, error: departmentError } = useDepartment()
    const monitorDepartments = useProjectMonitorDepartments()
    const [departmentId, setDepartmentId] = useState<number | null>(null)
    const realtime = useProjectMonitor(departmentId, "realtime")
    const cumulative = useProjectMonitor(departmentId, "cumulative")
    const [selected, setSelected] = useState<SelectedProject>(null)

    const ownDepartment = useMemo(() => {
        if (user?.d_id != null) {
            const byId = departments.find((department) => department.d_id === user.d_id)
            if (byId) return byId
        }
        const ownName = user?.d_department_en?.trim().toLowerCase()
        return ownName
            ? departments.find((department) => department.d_department_en.trim().toLowerCase() === ownName)
            : undefined
    }, [departments, user])

    const visibleDepartments = useMemo(
        () => departments.filter(
            (department) => monitorDepartments.departmentIds.includes(department.d_id)
                && (canViewOtherDepartments || department.d_id === ownDepartment?.d_id)
        ),
        [canViewOtherDepartments, departments, monitorDepartments.departmentIds, ownDepartment]
    )

    useEffect(() => {
        if (loadingDepartments || monitorDepartments.loading) return
        if (!canViewOtherDepartments) {
            if (ownDepartment && departmentId !== ownDepartment.d_id) {
                // eslint-disable-next-line react-hooks/set-state-in-effect -- ล็อก user ทั่วไปไว้ที่แผนกของตัวเอง
                setDepartmentId(ownDepartment.d_id)
            }
            return
        }
        if (departmentId !== null && visibleDepartments.some((department) => department.d_id === departmentId)) return
        const cadDepartment = visibleDepartments.find(
            (department) => department.d_department_en.trim().toLowerCase() === "cad"
        ) ?? visibleDepartments.find(
            (department) => department.d_department_en.toLowerCase().includes("cad")
        ) ?? visibleDepartments[0]
        if (!cadDepartment && departmentId === null) return
        setDepartmentId(cadDepartment?.d_id ?? null)
    }, [canViewOtherDepartments, departmentId, loadingDepartments, monitorDepartments.loading, ownDepartment, visibleDepartments])

    const selectedDepartment = departments.find((department) => department.d_id === departmentId)
    const usesManualTimeEntry = shouldUseManualTimeEntry(departmentId ?? undefined)
    const selectedProject = useMemo(() => {
        if (!selected) return undefined
        const source = selected.mode === "realtime" ? realtime.projects : cumulative.projects
        return source.find((project) => project.project_no === selected.projectNo)
    }, [selected, realtime.projects, cumulative.projects])
    const selectedExtraSeconds = selected?.mode === "realtime"
        ? realtime.extraSeconds
        : cumulative.extraSeconds
    const loading = realtime.loading || cumulative.loading
    const error = realtime.error || cumulative.error || departmentError || monitorDepartments.error

    const selectProject = (mode: ProjectMonitorMode) => (projectNo: string) => {
        setSelected({ projectNo, mode })
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-semibold">
                        <Activity className="size-5 text-emerald-600" />
                        Project Monitor
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        ดูงานที่กำลังทำแบบ realtime และเวลาสะสมของแต่ละ Project
                    </p>
                </div>
                <div className="flex items-end gap-2">
                    {canViewOtherDepartments ? (
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs font-normal text-muted-foreground">แผนก</Label>
                            <Select
                                value={departmentId === null ? "" : String(departmentId)}
                                onValueChange={(value) => {
                                    setSelected(null)
                                    setDepartmentId(Number(value))
                                }}
                                disabled={loadingDepartments || monitorDepartments.loading || visibleDepartments.length === 0}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="เลือกแผนก">
                                        {selectedDepartment?.d_department_en ?? "เลือกแผนก"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {visibleDepartments.map((department) => (
                                        <SelectItem key={department.d_id} value={String(department.d_id)}>
                                            {department.d_department_en}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs font-normal text-muted-foreground">แผนกของฉัน</Label>
                            <div className="flex h-8 min-w-36 items-center rounded-lg border bg-muted/40 px-3 text-sm font-medium">
                                {ownDepartment?.d_department_en ?? user?.d_department_en ?? "ไม่พบข้อมูลแผนก"}
                            </div>
                        </div>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => {
                            void realtime.refresh()
                            void cumulative.refresh()
                            void monitorDepartments.refresh()
                        }}
                        disabled={loading || departmentId === null}
                    >
                        <RefreshCw className={loading ? "animate-spin" : ""} />
                        รีเฟรช
                    </Button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {usesManualTimeEntry && (
                <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm">
                    <Clock3 className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                    <div>
                        <p className="font-medium">รูปแบบบันทึกเวลาของแผนก Finishing</p>
                        <p className="text-muted-foreground">
                            พนักงานระบุเวลาเริ่มและเวลาหยุดเองโดยไม่ใช้การจับเวลา real-time เวลาทำงานจริงจึงคำนวณจากช่วงเวลาที่บันทึกไว้ และแสดงในกราฟเวลาสะสม ส่วนกราฟกำลังทำงานตอนนี้จะแสดงเฉพาะรายการที่กำลังจับเวลาเท่านั้น
                        </p>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <MonitorChartCard
                    title="กำลังทำงานตอนนี้"
                    description={`แผนก ${selectedDepartment?.d_department_en ?? "-"} · รวมเฉพาะเวลาของรอบงานที่ยังไม่กดจบ`}
                    emptyDescription="ขณะนี้ยังไม่มีพนักงานกำลังทำ Project"
                    loading={loadingDepartments || realtime.loading}
                    projects={realtime.projects}
                    extraSeconds={realtime.extraSeconds}
                    icon={RadioTower}
                    statusLegend="realtime"
                    onSelect={selectProject("realtime")}
                />

                <MonitorChartCard
                    title="เวลาสะสมของ Project ที่ยังทำงานอยู่"
                    description={`แผนก ${selectedDepartment?.d_department_en ?? "-"} · รวมเวลาทุกรอบของทุกคน และซ่อนเมื่อทุกคนกดจบงานแล้ว`}
                    emptyDescription="ยังไม่มี Project ที่อยู่ระหว่างดำเนินการ"
                    loading={loadingDepartments || cumulative.loading}
                    projects={cumulative.projects}
                    extraSeconds={cumulative.extraSeconds}
                    icon={Activity}
                    statusLegend="cumulative"
                    onSelect={selectProject("cumulative")}
                />
            </div>

            <ProjectMembersDialog
                project={selectedProject}
                extraSeconds={selectedExtraSeconds}
                mode={selected?.mode ?? "cumulative"}
                onClose={() => setSelected(null)}
            />
        </div>
    )
}

type MonitorChartCardProps = {
    title: string
    description: string
    emptyDescription: string
    loading: boolean
    projects: ReturnType<typeof useProjectMonitor>["projects"]
    extraSeconds: number
    icon: typeof Activity
    statusLegend: ProjectMonitorMode
    onSelect: (projectNo: string) => void
}

function MonitorChartCard({
    title,
    description,
    emptyDescription,
    loading,
    projects,
    extraSeconds,
    icon: Icon,
    statusLegend,
    onSelect,
}: MonitorChartCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon className="size-4 text-emerald-600" />{title}</CardTitle>
                <CardDescription>{description} · คลิกแท่งกราฟเพื่อดูรายชื่อ</CardDescription>
            </CardHeader>
            <CardContent>
                {statusLegend === "realtime" ? (
                    <div className="mb-4 space-y-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
                        <div className="flex items-start gap-2">
                            <span className="mt-1 size-2.5 shrink-0 rounded-full bg-green-600" aria-hidden="true" />
                            <span>
                                <span className="font-medium">สีเขียว</span> — กำลังจับเวลาทำงานอยู่ในขณะนี้ เมื่อทุกคนหยุดจับเวลา Project จะหายจากกราฟนี้
                            </span>
                        </div>
                        <p className="border-t pt-2 text-muted-foreground">
                            <span className="font-medium text-foreground">เวลาทำงานจริง:</span> รวมเวลาตั้งแต่แต่ละคนกดเริ่มงานจนถึงเวลาปัจจุบัน
                        </p>
                    </div>
                ) : (
                    <div className="mb-4 space-y-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                            <div className="flex items-center gap-2">
                                <span className="size-2.5 shrink-0 rounded-full bg-green-600" aria-hidden="true" />
                                <span><span className="font-medium">สีเขียว</span> — มีคนกำลังจับเวลาทำงาน</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-2.5 shrink-0 rounded-full bg-amber-600" aria-hidden="true" />
                                <span><span className="font-medium">สีส้ม</span> — งานยังไม่จบ แต่ทุกคนหยุดจับเวลาอยู่</span>
                            </div>
                        </div>
                        <p className="border-t pt-2 text-muted-foreground">
                            <span className="font-medium text-foreground">เวลาทำงานจริง:</span> รวมทุกช่วงตั้งแต่กดเริ่มงานจนกดหยุดหรือจบงาน ไม่รวมช่วงที่หยุดจับเวลา · 24 ชม. = 1 วัน
                        </p>
                    </div>
                )}
                {loading && projects.length === 0 ? (
                    <div className="flex h-72 items-center justify-center"><Spinner /></div>
                ) : projects.length === 0 ? (
                    <div className="flex h-72 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                        <Icon className="size-9 opacity-50" />
                        <p className="font-medium text-foreground">ไม่พบข้อมูล</p>
                        <p className="text-sm">{emptyDescription}</p>
                    </div>
                ) : (
                    <ActiveProjectChart projects={projects} extraSeconds={extraSeconds} onSelect={onSelect} />
                )}
            </CardContent>
        </Card>
    )
}
