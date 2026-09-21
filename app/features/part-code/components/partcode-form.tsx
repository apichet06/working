

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
import { PartCodeFormSchema, type PartCodeFormValues } from "../lib/partcode_schema"
import { PartCode, Department } from "../type"
import { WorkplaceDTO } from "../../workplace/type"

type Options = { value: string; label: string }

type PartCodeFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    partCode?: PartCode | null
    departments: Department[]
    workplaces: WorkplaceDTO[] // Replace 'any' with the actual type of workplaces if available
    onSubmit: (values: PartCodeFormValues) => Promise<void>
}

export default function PartCodeForm({ open, onOpenChange, partCode, departments, workplaces, onSubmit }: PartCodeFormProps) {
    const isEdit = !!partCode

    const departmentOptions = useMemo<Options[]>(
        () => departments.map((department) => ({ value: String(department.d_id), label: department.d_department_en })),
        [departments]
    )
    const workplaceOptions = useMemo<Options[]>(
        () => workplaces.map((workplace) => ({ value: String(workplace.wp_id), label: workplace.wp_name_en })),
        [workplaces]
    )

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PartCodeFormValues>({
        resolver: zodResolver(PartCodeFormSchema),
        defaultValues: {
            part_code: partCode?.part_code ?? "",
            dp_id: partCode?.dp_id ? String(partCode.dp_id) : "",
            part_descriptions: partCode?.part_descriptions ?? "",
            wp_id: String(partCode?.wp_id ?? workplaces[0]?.wp_id ?? ""),
        },
    })

    useEffect(() => {
        if (!open) return
        reset({
            part_code: partCode?.part_code ?? "",
            dp_id: partCode?.dp_id ? String(partCode.dp_id) : "",
            part_descriptions: partCode?.part_descriptions ?? "",
            wp_id: String(partCode?.wp_id ?? workplaces[0]?.wp_id ?? ""),
        })
    }, [open, partCode, workplaces, reset])

    const submit = async (values: PartCodeFormValues) => {
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
                    <DialogTitle>{isEdit ? "แก้ไขรหัสชิ้นงาน" : "เพิ่มรหัสชิ้นงาน"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "แก้ไขข้อมูลรหัสชิ้นงานที่เลือก" : "กรอกข้อมูลเพื่อเพิ่มรหัสชิ้นงานใหม่"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(submit)} noValidate>
                    <FieldGroup className="mb-5">
                        <Field data-invalid={!!errors.part_code}>
                            <FieldLabel htmlFor="part_code">รหัสชิ้นงาน</FieldLabel>
                            <Input
                                id="part_code"
                                type="text"
                                placeholder="เช่น 100"
                                aria-invalid={!!errors.part_code}
                                inputMode="numeric"
                                {...register("part_code", {
                                    onChange: (e) => {
                                        e.target.value = e.target.value.replace(/\D/g, "")
                                    },
                                })}
                                maxLength={7}
                            />
                            <FieldError errors={[errors.part_code]} />
                        </Field>

                        <Field data-invalid={!!errors.wp_id}>
                            <FieldLabel htmlFor="wp_id">สาขา</FieldLabel>
                            <Controller
                                control={control}
                                name="wp_id"
                                render={({ field }) => {
                                    const selected = workplaceOptions.find((option) => option.value === field.value) ?? null
                                    return (
                                        <Combobox
                                            items={workplaceOptions}
                                            value={selected}
                                            onValueChange={(option: Options | null) => field.onChange(option?.value ?? "")}
                                        >
                                            <ComboboxInput
                                                id="wp_id"
                                                placeholder="ค้นหาสาขา..."
                                                aria-invalid={!!errors.wp_id}
                                                disabled={workplaces.length <= 1}
                                                showClear={workplaces.length > 1}
                                            />
                                            <ComboboxContent>
                                                <ComboboxEmpty>ไม่พบสาขา</ComboboxEmpty>
                                                <ComboboxList>
                                                    {(option: Options) => (
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
                            <FieldError errors={[errors.wp_id]} />
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
                                            onValueChange={(option: Options | null) => field.onChange(option?.value ?? "")}
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
                                                    {(option: Options) => (
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
                        <Field data-invalid={!!errors.part_descriptions}>
                            <FieldLabel htmlFor="part_descriptions">รายละเอียด</FieldLabel>
                            <Textarea
                                id="part_descriptions"
                                placeholder="รายละเอียดรหัสชิ้นงาน"
                                aria-invalid={!!errors.part_descriptions}
                                {...register("part_descriptions")}
                            />
                            <FieldError errors={[errors.part_descriptions]} />
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
