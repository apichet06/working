import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getWorkActionStatusStyle } from "@/lib/work-action-status"

type WorkActionStatusBadgeProps = {
    status: string | null | undefined
    className?: string
}

export function WorkActionStatusBadge({ status, className }: WorkActionStatusBadgeProps) {
    const { label, className: statusClassName } = getWorkActionStatusStyle(status)

    return (
        <Badge variant="outline" className={cn(statusClassName, className)}>
            {label}
        </Badge>
    )
}
