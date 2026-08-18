"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export type RankedItem = { label: string; value: number }

type RankedBarChartProps = {
    title: string
    description?: string
    items: RankedItem[]
    valueLabel: string
    color: { light: string; dark: string }
    loading?: boolean
}

const VALUE_KEY = "value"
const ROW_HEIGHT = 44
const VISIBLE_ROWS = 6
const Y_AXIS_WIDTH = 160
const MAX_LABEL_LENGTH = 24
const CHART_MARGIN = { left: 0, right: 32, top: 8, bottom: 0 }

// ตัด label ที่ยาวเกินไปกันล้นกรอบ — tooltip ตอน hover ยังเห็นข้อความเต็มเพราะอ่านจากข้อมูลดิบ ไม่ใช่ tick ที่ตัดแล้ว
function truncateLabel(label: string): string {
    return label.length > MAX_LABEL_LENGTH ? `${label.slice(0, MAX_LABEL_LENGTH - 1)}…` : label
}

type YAxisTickProps = {
    x?: number
    y?: number
    payload?: { value?: string }
}

// วาด tick แกน Y เอง 2 บรรทัด: บรรทัดแรกรหัส (สั้น ไม่ต้องตัด) บรรทัดที่สองรายละเอียด (ตัดถ้ายาวไป)
// label ต้นทางต้องคั่นสองส่วนนี้ด้วย \n (ดูฟังก์ชัน jobBreakdownToRankedItems/projectBreakdownToRankedItems ในหน้า dashboard)
function YAxisTick({ x = 0, y = 0, payload }: YAxisTickProps) {
    const [primary, secondary] = (payload?.value ?? "").split("\n")
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={-8} y={-4} textAnchor="end" className="fill-foreground text-xs font-medium">
                {primary}
            </text>
            {secondary && (
                <text x={-8} y={11} textAnchor="end" className="fill-muted-foreground text-[10px]">
                    {truncateLabel(secondary)}
                </text>
            )}
        </g>
    )
}

// สร้างเลขไม้บรรทัด count ตัว หารช่วง [0, max] เท่าๆ กัน (ไม่พึ่ง recharts เพราะ chart อันที่สองที่ไม่มี data มันไม่ยอม render อะไรเลย)
function buildTicks(max: number, count = 5): number[] {
    if (max <= 0) return [0]
    const step = max / (count - 1)
    return Array.from({ length: count }, (_, i) => Number((step * i).toFixed(2)))
}

// แสดงทุกรายการ เรียงจากมากไปน้อย — ถ้าเกิน VISIBLE_ROWS แถว ให้ scroll ดูที่เหลือได้ (กรอบสีน้ำเงิน)
// ส่วนแกน X (ตัวเลข) วาดเองด้วย HTML/CSS ไว้นอกกรอบ scroll ด้านล่าง คงที่ตลอดไม่เลื่อนหาย (กรอบสีแดง)
export function RankedBarChart({
    title,
    description,
    items,
    valueLabel,
    color,
    loading,
}: RankedBarChartProps) {
    const data = [...items].sort((a, b) => b.value - a.value)
    const maxValue = data.reduce((max, item) => Math.max(max, item.value), 0)
    const domain: [number, number] = [0, maxValue > 0 ? maxValue : 1]
    const ticks = buildTicks(domain[1])

    const config: ChartConfig = {
        [VALUE_KEY]: { label: valueLabel, theme: color },
    }
    // เผื่อพื้นที่ CHART_MARGIN.top/bottom เพิ่มจากความสูงแถวเสมอ ไม่งั้น recharts จะหาร margin เฉลี่ยเข้าไปในแต่ละแถว (band = height/data.length)
    // ทำให้แถวเตี้ยกว่า ROW_HEIGHT จริง โดยเห็นชัดสุดตอนมีแถวน้อยๆ เช่น 1 แถว (36px แทนที่จะเป็น 44px)
    const marginY = CHART_MARGIN.top + CHART_MARGIN.bottom
    const plotHeight = Math.max(data.length * ROW_HEIGHT, ROW_HEIGHT) + marginY
    const viewportHeight = Math.min(data.length, VISIBLE_ROWS) * ROW_HEIGHT + marginY

    return (
        <Card>
            <CardHeader className="flex flex-col gap-1">
                <p className="font-medium">{title}</p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex h-32 items-center justify-center">
                        <Spinner />
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                        ไม่พบข้อมูล
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {/* กรอบสีน้ำเงิน: แท่ง + label ฝั่งซ้าย เลื่อนดูได้เมื่อรายการเกิน 6 แถว */}
                        <div className="overflow-y-auto" style={{ maxHeight: viewportHeight }}>
                            <ChartContainer config={config} className="aspect-auto w-full" style={{ height: plotHeight }}>
                                <BarChart data={data} layout="vertical" margin={CHART_MARGIN}>
                                    <CartesianGrid horizontal={false} />
                                    <XAxis
                                        type="number"
                                        domain={domain}
                                        ticks={ticks}
                                        tick={false}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        width={Y_AXIS_WIDTH}
                                        tick={<YAxisTick />}
                                        interval={0}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar
                                        dataKey={VALUE_KEY}
                                        fill={`var(--color-${VALUE_KEY})`}
                                        radius={[0, 4, 4, 0]}
                                        maxBarSize={20}
                                    >
                                        <LabelList
                                            dataKey={VALUE_KEY}
                                            position="right"
                                            offset={8}
                                            className="fill-foreground text-xs"
                                        />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </div>
                        {/* กรอบสีแดง: แกน X ตัวเลข วาดเองด้วย HTML/CSS (ไม่ใช้ recharts) อยู่นอกกรอบ scroll ด้านบน คงที่ตลอด
                            padding ซ้าย/ขวาเท่ากับความกว้างแกน Y / margin ขวาของกราฟด้านบน ให้ตัวเลขตรงกับเส้นไม้บรรทัดในกราฟพอดี
                            ticks มาจาก buildTicks ชุดเดียวกับที่ป้อนให้ XAxis ด้านบน (ผ่าน prop ticks) จึงเรียงห่างเท่ากันพอดี ใช้ justify-between วางแทนคำนวณ % เอง */}
                        <div
                            className="flex justify-between pt-1 text-xs text-muted-foreground"
                            style={{ paddingLeft: Y_AXIS_WIDTH, paddingRight: CHART_MARGIN.right }}
                        >
                            {ticks.map((tick) => (
                                <span key={tick}>{tick}</span>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
