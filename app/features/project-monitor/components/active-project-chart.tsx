"use client"

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"
import { ActiveProject } from "../type"
import { formatElapsed } from "../lib/format-duration"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"

type ActiveProjectChartProps = {
    projects: ActiveProject[]
    extraSeconds: number
    onSelect: (projectNo: string) => void
}

type ProjectChartPoint = ActiveProject & {
    elapsed_hours: number
    duration_label: string
    axis_label: string
}

type YAxisTickProps = {
    x?: number
    y?: number
    payload?: { value?: string }
}

function truncateDescription(value: string): string {
    return value.length > 22 ? `${value.slice(0, 21)}…` : value
}

function ProjectYAxisTick({ x = 0, y = 0, payload }: YAxisTickProps) {
    const [projectNo, description] = (payload?.value ?? "").split("\n")
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={-8} y={-4} textAnchor="end" className="fill-foreground text-xs font-semibold">
                {projectNo}
            </text>
            {description && (
                <text x={-8} y={11} textAnchor="end" className="fill-muted-foreground text-[10px]">
                    {truncateDescription(description)}
                </text>
            )}
        </g>
    )
}

const chartConfig = {
    elapsed_hours: {
        label: "เวลาทำงานรวม",
        theme: { light: "#0d9488", dark: "#2dd4bf" },
    },
} satisfies ChartConfig

export function ActiveProjectChart({ projects, extraSeconds, onSelect }: ActiveProjectChartProps) {
    const data: ProjectChartPoint[] = projects.map((project) => {
        const elapsedSeconds = project.elapsed_seconds + (extraSeconds * project.active_member_count)
        return {
            ...project,
            elapsed_hours: Math.max(elapsedSeconds / 3_600, 0.02),
            duration_label: formatElapsed(elapsedSeconds),
            axis_label: project.die_descriptions
                ? `${project.project_no}\n${project.die_descriptions}`
                : project.project_no,
        }
    })
    const height = Math.max(300, projects.length * 62)

    return (
        <ChartContainer
            config={chartConfig}
            className="aspect-auto w-full"
            style={{ height }}
            initialDimension={{ width: 800, height }}
        >
            <BarChart
                accessibilityLayer
                data={data}
                layout="vertical"
                margin={{ top: 8, right: 100, bottom: 8, left: 8 }}
            >
                <CartesianGrid horizontal={false} />
                <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${Math.floor(Number(value))} ชม.`}
                />
                <YAxis
                    type="category"
                    dataKey="axis_label"
                    tickLine={false}
                    axisLine={false}
                    width={150}
                    tick={<ProjectYAxisTick />}
                    interval={0}
                />
                <ChartTooltip
                    cursor={{ fill: "var(--muted)" }}
                    content={({ active, payload }) => {
                        const point = payload?.[0]?.payload as ProjectChartPoint | undefined
                        if (!active || !point) return null
                        return (
                            <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                                <p className="font-medium">Project {point.project_no}</p>
                                {point.die_descriptions && (
                                    <p className="text-muted-foreground">{point.die_descriptions}</p>
                                )}
                                <p className="text-muted-foreground">รวม {point.duration_label} · {point.member_count} คน</p>
                                <p className={point.active_member_count > 0 ? "mt-1 font-medium text-emerald-600" : "mt-1 font-medium text-amber-600"}>
                                    {point.active_member_count > 0
                                        ? `กำลังทำงาน ${point.active_member_count} คน`
                                        : "ยังไม่จบงาน · หยุดจับเวลาอยู่"}
                                </p>
                                <p className="mt-1 text-muted-foreground">คลิกเพื่อดูรายชื่อ</p>
                            </div>
                        )
                    }}
                />
                <Bar
                    dataKey="elapsed_hours"
                    fill="var(--color-elapsed_hours)"
                    radius={[0, 5, 5, 0]}
                    maxBarSize={32}
                    isAnimationActive={false}
                    className="cursor-pointer"
                    onClick={(_, index) => onSelect(data[index].project_no)}
                >
                    {data.map((point) => (
                        <Cell
                            key={point.project_no}
                            fill={point.active_member_count > 0 ? "#16a34a" : "#d97706"}
                        />
                    ))}
                    <LabelList
                        dataKey="duration_label"
                        position="right"
                        offset={8}
                        className="fill-foreground text-xs font-medium"
                    />
                </Bar>
            </BarChart>
        </ChartContainer>
    )
}
