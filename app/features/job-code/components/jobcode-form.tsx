

import { useEffect, useMemo } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { parseApiError } from "@/lib/parse-api-error"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { JobCodeFormSchema, type JobCodeFormValues } from "../lib/job_schema"
import { JobCode, Department } from "../type"

type DepartmentOption = { value: string; label: string }

type JobCodeFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    jobCode?: JobCode | null
    departments: Department[]
    onSubmit: (values: JobCodeFormValues) => Promise<void>
}

export default function JobCodeForm({ open, onOpenChange, jobCode, departments, onSubmit }: JobCodeFormProps) {
    const isEdit = !!jobCode

    const departmentOptions = useMemo<DepartmentOption[]>(
        () => departments.map((department) => ({ value: String(department.d_id), label: department.d_department_en })),
        [departments]
    )

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<JobCodeFormValues>({
        resolver: zodResolver(JobCodeFormSchema),
        defaultValues: {
            job_code: jobCode?.job_code ?? "",
            dp_id: jobCode?.dp_id ? String(jobCode.dp_id) : "",
            job_descriptions: jobCode?.job_descriptions ?? "",
        },
    })

    useEffect(() => {
        if (!open) return
        reset({
            job_code: jobCode?.job_code ?? "",
            dp_id: jobCode?.dp_id ? String(jobCode.dp_id) : "",
            job_descriptions: jobCode?.job_descriptions ?? "",
        })
    }, [open, jobCode, reset])

    const submit = async (values: JobCodeFormValues) => {
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
                    <DialogTitle>{isEdit ? "แก้ไขรหัสงาน" : "เพิ่มรหัสงาน"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "แก้ไขข้อมูลรหัสงานที่เลือก" : "กรอกข้อมูลเพื่อเพิ่มรหัสงานใหม่"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(submit)} noValidate>
                    <FieldGroup className="mb-5">
                        <Field data-invalid={!!errors.job_code}>
                            <FieldLabel htmlFor="job_code">รหัสงาน</FieldLabel>
                            <Input
                                id="job_code"
                                type="text"
                                inputMode="numeric"
                                placeholder="เช่น 1000"
                                aria-invalid={!!errors.job_code}
                                {...register("job_code", {
                                    onChange: (e) => {
                                        e.target.value = e.target.value.replace(/\D/g, "")
                                    },
                                })}
                                maxLength={7}
                            />
                            <FieldError errors={[errors.job_code]} />
                        </Field>

                        <Field data-invalid={!!errors.dp_id}>
                            <FieldLabel htmlFor="dp_id">แผนก</FieldLabel>
                            <Controller
                                control={control}
                                name="dp_id"
                                render={({ field }) => {
                                    const selected = departmentOptions.find((option) => option.value === field.value) ?? null
                                    return (
                                        <Combobox
                                            items={departmentOptions}
                                            value={selected}
                                            onValueChange={(option: DepartmentOption | null) => field.onChange(option?.value ?? "")}
                                        >
                                            <ComboboxInput
                                                id="dp_id"
                                                placeholder="ค้นหาแผนก..."
                                                aria-invalid={!!errors.dp_id}
                                                showClear
                                            />
                                            <ComboboxContent>
                                                <ComboboxEmpty>ไม่พบแผนก</ComboboxEmpty>
                                                <ComboboxList>
                                                    {(option: DepartmentOption) => (
                                                        <ComboboxItem key={option.value} value={option}>
                                                            {option.label}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                    )
                                }}
                            />
                            <FieldError errors={[errors.dp_id]} />
                        </Field>
                        <Field data-invalid={!!errors.job_descriptions}>
                            <FieldLabel htmlFor="job_descriptions">รายละเอียด</FieldLabel>
                            <Textarea
                                id="job_descriptions"
                                placeholder="รายละเอียดรหัสงาน"
                                aria-invalid={!!errors.job_descriptions}
                                {...register("job_descriptions")}
                            />
                            <FieldError errors={[errors.job_descriptions]} />
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
