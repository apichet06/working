import { apiFetchWR } from "@/lib/api-client"
import { ActiveProject, ActiveProjectsResponse, MonitorDepartmentsResponse } from "../type"

export const projectMonitorService = {
    async getActiveProjects(departmentId: number): Promise<ActiveProject[]> {
        const params = new URLSearchParams({ department: String(departmentId) })
        const response = await apiFetchWR<ActiveProjectsResponse>(`project-monitor/active?${params.toString()}`)
        return response.data
    },

    async getRealtimeProjects(departmentId: number): Promise<ActiveProject[]> {
        const params = new URLSearchParams({ department: String(departmentId) })
        const response = await apiFetchWR<ActiveProjectsResponse>(`project-monitor/realtime?${params.toString()}`)
        return response.data
    },

    async getDepartmentIds(): Promise<number[]> {
        const response = await apiFetchWR<MonitorDepartmentsResponse>("project-monitor/departments")
        return response.data
    },
}
