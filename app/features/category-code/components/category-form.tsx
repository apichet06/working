

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
import { CategoryCodeFormSchema, type CategoryCodeFormValues } from "../lib/category_schema"
import { CategoryCode, Department } from "../type"

type DepartmentOption = { value: string; label: string }

type CategoryCodeFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    categoryCode?: CategoryCode | null
    departments: Department[]
    onSubmit: (values: CategoryCodeFormValues) => Promise<void>
}

export default function CategoryCodeForm({ open, onOpenChange, categoryCode, departments, onSubmit }: CategoryCodeFormProps) {
    const isEdit = !!categoryCode

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
    } = useForm<CategoryCodeFormValues>({
        resolver: zodResolver(CategoryCodeFormSchema),
        defaultValues: {
            cc_code: categoryCode?.cc_code ?? "",
            dp_id: categoryCode?.dp_id ? String(categoryCode.dp_id) : "",
            cc_descriptions: categoryCode?.cc_descriptions ?? "",
        },
    })

    useEffect(() => {
        if (!open) return
        reset({
            cc_code: categoryCode?.cc_code ?? "",
            dp_id: categoryCode?.dp_id ? String(categoryCode.dp_id) : "",
            cc_descriptions: categoryCode?.cc_descriptions ?? "",
        })
    }, [open, categoryCode, reset])

    const submit = async (values: CategoryCodeFormValues) => {
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
                    <DialogTitle>{isEdit ? "แก้ไขรหัสหมวดหมู่" : "เพิ่มรหัสหมวดหมู่"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "แก้ไขข้อมูลรหัสหมวดหมู่ที่เลือก" : "กรอกข้อมูลเพื่อเพิ่มรหัสหมวดหมู่ใหม่"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(submit)} noValidate>
                    <FieldGroup className="mb-5">
                        <Field data-invalid={!!errors.cc_code}>
                            <FieldLabel htmlFor="cc_code">รหัสหมวดหมู่</FieldLabel>
                            <Input
                                id="cc_code"
                                type="text"
                                placeholder="เช่น 1"
                                inputMode="numeric"
                                aria-invalid={!!errors.cc_code}
                                {...register("cc_code", {
                                    onChange: (e) => {
                                        e.target.value = e.target.value.replace(/\D/g, "")
                                    },
                                })}
                                maxLength={3}
                            />
                            <FieldError errors={[errors.cc_code]} />
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
                        <Field data-invalid={!!errors.cc_descriptions}>
                            <FieldLabel htmlFor="cc_descriptions">รายละเอียด</FieldLabel>
                            <Textarea
                                id="cc_descriptions"
                                placeholder="รายละเอียดรหัสหมวดหมู่"
                                aria-invalid={!!errors.cc_descriptions}
                                {...register("cc_descriptions")}
                            />
                            <FieldError errors={[errors.cc_descriptions]} />
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
