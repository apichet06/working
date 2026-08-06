import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { parseApiError } from "@/lib/parse-api-error"
import { FormatDate, toTimeValue } from "@/lib/formDatetime"
import { WorkingTimeFormSchema, type WorkingTimeFormValues } from "../lib/working-time.schema"
import { WorkingActionsJobList } from "../type"

type WorkingTimeFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    workingAction: WorkingActionsJobList | null
    onSubmit: (values: WorkingTimeFormValues) => Promise<void>
}

export default function WorkingTimeForm({ open, onOpenChange, workingAction, onSubmit }: WorkingTimeFormProps) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<WorkingTimeFormValues>({
        resolver: zodResolver(WorkingTimeFormSchema),
        defaultValues: {
            wa_start_time: toTimeValue(workingAction?.wa_start_job),
            wa_end_time: toTimeValue(workingAction?.wa_end_job),
        },
    })

    useEffect(() => {
        if (!open) return
        reset({
            wa_start_time: toTimeValue(workingAction?.wa_start_job),
            wa_end_time: toTimeValue(workingAction?.wa_end_job),
        })
    }, [open, workingAction, reset])

    const submit = async (values: WorkingTimeFormValues) => {
        try {
            await onSubmit(values)
            onOpenChange(false)
        } catch (err) {
            toast.add({
                title: "บันทึกข้อมูลไม่สำเร็จ",
                description: parseApiError(err, "บันทึกข้อมูลไม่สำเร็จ"),
                type: "error",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>แก้ไขเวลาทำงาน</DialogTitle>
                    <DialogDescription>
                        แก้ไขได้เฉพาะเวลาเริ่มงานและเวลาสิ้นสุดงาน วันที่ทำงานไม่สามารถแก้ไขได้
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(submit)} noValidate>
                    <FieldGroup className="mb-5">
                        <Field>
                            <FieldLabel htmlFor="working_date">วันที่ทำงาน</FieldLabel>
                            <Input
                                id="working_date"
                                type="text"
                                disabled
                                readOnly
                                value={workingAction ? FormatDate(workingAction.working_date) : ""}
                            />
                        </Field>
                        <Field data-invalid={!!errors.wa_start_time}>
                            <FieldLabel htmlFor="wa_start_time">เวลาเริ่มงาน</FieldLabel>
                            <Controller
                                control={control}
                                name="wa_start_time"
                                render={({ field }) => (
                                    <Input
                                        id="wa_start_time"
                                        type="time"
                                        step="1"
                                        aria-invalid={!!errors.wa_start_time}
                                        value={field.value}
                                        onChange={field.onChange}
                                        className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                )}
                            />
                            <FieldError errors={[errors.wa_start_time]} />
                        </Field>
                        <Field data-invalid={!!errors.wa_end_time}>
                            <FieldLabel htmlFor="wa_end_time">เวลาสิ้นสุดงาน</FieldLabel>
                            <Controller
                                control={control}
                                name="wa_end_time"
                                render={({ field }) => (
                                    <Input
                                        id="wa_end_time"
                                        type="time"
                                        step="1"
                                        aria-invalid={!!errors.wa_end_time}
                                        value={field.value}
                                        onChange={field.onChange}
                                        className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                )}
                            />
                            <FieldError errors={[errors.wa_end_time]} />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
