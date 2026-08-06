
import { useMemo, useState } from "react"
import { ChevronDownIcon, FilterIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type MultiSelectOption = {
    value: string
    label: string
    count: number
}

type MultiSelectFilterProps = {
    label: string
    searchPlaceholder: string
    emptyText: string
    options: MultiSelectOption[]
    selected: string[]
    onChange: (values: string[]) => void
    /** "select" = trigger หน้าตาเหมือน Select/Combobox (placeholder + chevron), "button" = ปุ่ม outline พร้อม icon กรวยและ badge จำนวน */
    variant?: "select" | "button"
    className?: string
}

export function MultiSelectFilter({
    label,
    searchPlaceholder,
    emptyText,
    options,
    selected,
    onChange,
    variant = "select",
    className,
}: MultiSelectFilterProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")

    const filteredOptions = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return options
        return options.filter((option) => option.label.toLowerCase().includes(q))
    }, [options, query])

    const toggle = (value: string, checked: boolean) => {
        onChange(checked ? [...selected, value] : selected.filter((v) => v !== value))
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            {variant === "select" ? (
                <PopoverTrigger
                    className={cn(
                        "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:w-auto dark:bg-input/30 dark:hover:bg-input/50",
                        className
                    )}
                >
                    <span className={cn("truncate", selected.length === 0 && "text-muted-foreground")}>
                        {label}
                        {selected.length > 0 && ` (${selected.length})`}
                    </span>
                    <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
                </PopoverTrigger>
            ) : (
                <PopoverTrigger
                    className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2 font-normal md:w-auto", className)}
                >
                    <FilterIcon />
                    {label}
                    {selected.length > 0 && <Badge variant="secondary">{selected.length}</Badge>}
                </PopoverTrigger>
            )}
            <PopoverContent className="w-(--anchor-width) min-w-56 gap-0 p-0" align="start">
                <div className="border-b p-2">
                    <Input
                        placeholder={searchPlaceholder}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="h-8"
                        autoFocus
                    />
                </div>
                <div className="max-h-72 overflow-y-auto p-1">
                    {filteredOptions.length === 0 ? (
                        <p className="p-3 text-center text-sm text-muted-foreground">{emptyText}</p>
                    ) : (
                        filteredOptions.map((option) => {
                            const checked = selected.includes(option.value)
                            // count มาจาก faceted count ตาม filter อื่นที่เลือกอยู่ — 0 แปลว่าเลือกแล้วจะไม่เจอข้อมูลเลย จึง disable
                            // (ยกเว้นตัวที่เลือกอยู่แล้ว ต้อง uncheck ได้เสมอ)
                            const disabled = option.count === 0 && !checked
                            return (
                                <label
                                    key={option.value}
                                    className={cn(
                                        "flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                                        disabled && "cursor-not-allowed text-muted-foreground opacity-50 hover:bg-transparent"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <Checkbox
                                            checked={checked}
                                            disabled={disabled}
                                            onCheckedChange={(value) => toggle(option.value, value === true)}
                                        />
                                        {option.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{option.count}</span>
                                </label>
                            )
                        })
                    )}
                </div>
                <div className="border-t p-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-muted-foreground"
                        disabled={selected.length === 0}
                        onClick={() => onChange([])}
                    >
                        ล้างตัวกรอง
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
