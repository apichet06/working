

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
import { DieCodeFormSchema, type DieCodeFormValues } from "../lib/die_schema"
import { DieCode, Department } from "../type"

type DepartmentOption = { value: string; label: string }

type DieCodeFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    dieCode?: DieCode | null
    departments: Department[]
    onSubmit: (values: DieCodeFormValues) => Promise<void>
}

export default function DieCodeForm({ open, onOpenChange, dieCode, departments, onSubmit }: DieCodeFormProps) {
    const isEdit = !!dieCode

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
    } = useForm<DieCodeFormValues>({
        resolver: zodResolver(DieCodeFormSchema),
        defaultValues: {
            die_code: dieCode?.die_code ?? "",
            dp_id: dieCode?.dp_id ? String(dieCode.dp_id) : "",
            die_descriptions: dieCode?.die_descriptions ?? "",
        },
    })

    useEffect(() => {
        if (!open) return
        reset({
            die_code: dieCode?.die_code ?? "",
            dp_id: dieCode?.dp_id ? String(dieCode.dp_id) : "",
            die_descriptions: dieCode?.die_descriptions ?? "",
        })
    }, [open, dieCode, reset])

    const submit = async (values: DieCodeFormValues) => {
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
                    <DialogTitle>{isEdit ? "แก้ไขรหัสดาย" : "เพิ่มรหัสดาย"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "แก้ไขข้อมูลรหัสดายที่เลือก" : "กรอกข้อมูลเพื่อเพิ่มรหัสดายใหม่"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(submit)} noValidate>
                    <FieldGroup className="mb-5">
                        <Field data-invalid={!!errors.die_code}>
                            <FieldLabel htmlFor="die_code">รหัสดาย</FieldLabel>
                            <Input
                                id="die_code"
                                type="text"
                                placeholder="เช่น DIE-001"
                                aria-invalid={!!errors.die_code}
                                {...register("die_code")}
                                maxLength={50}
                            />
                            <FieldError errors={[errors.die_code]} />
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
                        <Field data-invalid={!!errors.die_descriptions}>
                            <FieldLabel htmlFor="die_descriptions">รายละเอียด</FieldLabel>
                            <Textarea
                                id="die_descriptions"
                                placeholder="รายละเอียดรหัสดาย"
                                aria-invalid={!!errors.die_descriptions}
                                {...register("die_descriptions")}
                            />
                            <FieldError errors={[errors.die_descriptions]} />
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
