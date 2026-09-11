"use client"

import { ActiveProject } from "../type"
import { formatElapsed } from "../lib/format-duration"
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Users } from "lucide-react"
import { ProjectMonitorMode } from "../hook/use-project-monitor"

type ProjectMembersDialogProps = {
    project?: ActiveProject
    extraSeconds: number
    mode: ProjectMonitorMode
    onClose: () => void
}

function initials(name: string): string {
    return name.trim().slice(0, 2).toUpperCase()
}

export function ProjectMembersDialog({ project, extraSeconds, mode, onClose }: ProjectMembersDialogProps) {
    return (
        <Dialog open={Boolean(project)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                {project && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Project {project.project_no}</DialogTitle>
                            {project.die_descriptions && (
                                <p className="text-sm font-medium text-foreground">{project.die_descriptions}</p>
                            )}
                            <DialogDescription>
                                {mode === "realtime" ? "ผู้ที่กำลังทำงาน" : "ผู้ที่ยังไม่กดจบงาน"} {project.member_count} คน · {mode === "realtime" ? "เวลาของงานปัจจุบันรวม" : "เวลาสะสมทั้งหมด"} {formatElapsed(project.elapsed_seconds + (extraSeconds * project.active_member_count))}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                            {project.members.map((member) => (
                                <div key={member.e_id} className="flex items-start gap-3 rounded-lg border p-3">
                                    <Avatar size="lg" className="mt-0.5">
                                        <AvatarFallback>{initials(member.e_name)}</AvatarFallback>
                                        <AvatarBadge className={member.is_working ? "bg-emerald-500" : "bg-amber-500"} />
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{member.e_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {member.e_usercode ? `${member.e_usercode} · ` : ""}
                                            {mode === "realtime" ? "กำลังทำงานรอบนี้" : "เวลาสะสม"} {formatElapsed(member.elapsed_seconds + (member.is_working ? extraSeconds : 0))}
                                        </p>
                                        {mode === "cumulative" && (
                                            <p className={member.is_working ? "text-xs text-emerald-600" : "text-xs text-amber-600"}>
                                                {member.is_working ? "กำลังทำงาน" : "ยังไม่จบงาน · หยุดจับเวลาอยู่"}
                                            </p>
                                        )}
                                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3 text-xs sm:grid-cols-3">
                                            <div>
                                                <p className="text-muted-foreground">Job Code</p>
                                                <p className="font-medium">{member.job_code || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Category Code</p>
                                                <p className="font-medium">{member.cc_code || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Part Code</p>
                                                <p className="font-medium">{member.part_code || "-"}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-3">
                                                <p className="text-muted-foreground">Detail</p>
                                                <p className="whitespace-pre-wrap break-words font-medium">{member.w_desc || "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Users className="mt-1 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
