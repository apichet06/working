"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type ChartPoint = Record<string, string | number>

type SummaryBarChartProps<T extends ChartPoint> = {
    title: string
    description?: string
    data: T[]
    xKey: keyof T & string
    valueKey: keyof T & string
    valueLabel: string
    color: { light: string; dark: string }
    loading?: boolean
}

export function SummaryBarChart<T extends ChartPoint>({
    title,
    description,
    data,
    xKey,
    valueKey,
    valueLabel,
    color,
    loading,
}: SummaryBarChartProps<T>) {
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
                        <BarChart data={data} margin={{ left: 0, right: 0, top: 24, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey={xKey as never}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                interval="preserveStartEnd"
                            />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey={valueKey as never}
                                fill={`var(--color-${valueKey})`}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={24}
                            >
                                <LabelList
                                    dataKey={valueKey as never}
                                    position="top"
                                    offset={8}
                                    className="fill-foreground text-xs"
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
