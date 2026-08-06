"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type ChartPoint = Record<string, string | number>

type SummaryLineChartProps<T extends ChartPoint> = {
    title: string
    description?: string
    data: T[]
    xKey: keyof T & string
    valueKey: keyof T & string
    valueLabel: string
    color: { light: string; dark: string }
    loading?: boolean
}

export function SummaryLineChart<T extends ChartPoint>({
    title,
    description,
    data,
    xKey,
    valueKey,
    valueLabel,
    color,
    loading,
}: SummaryLineChartProps<T>) {
    const config: ChartConfig = {
        [valueKey]: { label: valueLabel, theme: color },
    }

    return (
        <Card>
            <CardHeader className="flex flex-col gap-1">
                <p className="font-medium">{title}</p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Spinner />
                    </div>
                ) : (
                    <ChartContainer config={config} className="aspect-auto h-64 w-full">
                        <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey={xKey as never}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                interval="preserveStartEnd"
                            />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                dataKey={valueKey as never}
                                type="monotone"
                                stroke={`var(--color-${valueKey})`}
                                strokeWidth={2}
                                dot={{ r: 4, fill: `var(--color-${valueKey})`, stroke: "var(--card)", strokeWidth: 2 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
