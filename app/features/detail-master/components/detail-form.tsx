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
import { DetailMasterFormSchema, type DetailMasterFormValues } from "../lib/detail_schema"
import { DetailMaster, Department } from "../type"

type DepartmentOption = { value: string; label: string }

type DetailMasterFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    detailMaster?: DetailMaster | null
    departments: Department[]
    onSubmit: (values: DetailMasterFormValues) => Promise<void>
}

export default function DetailMasterForm({ open, onOpenChange, detailMaster, departments, onSubmit }: DetailMasterFormProps) {
    const isEdit = !!detailMaster

    const departmentOptions = useMemo<DepartmentOption[]>(
        () => departments.map((department) => ({ value: String(department.d_id), label: department.d_department_en })),
        [departments]
    )

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<DetailMasterFormValues>({
        resolver: zodResolver(DetailMasterFormSchema),
        defaultValues: {
            dp_id: detailMaster?.dp_id ? String(detailMaster.dp_id) : "",
            detail_descriptions: detailMaster?.detail_descriptions ?? "",
        },
    })

    useEffect(() => {
        if (!open) return
        reset({
            dp_id: detailMaster?.dp_id ? String(detailMaster.dp_id) : "",
            detail_descriptions: detailMaster?.detail_descriptions ?? "",
        })
    }, [open, detailMaster, reset])

    const submit = async (values: DetailMasterFormValues) => {
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
                    <DialogTitle>{isEdit ? "แก้ไขรายละเอียด" : "เพิ่มรายละเอียด"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "แก้ไขข้อมูลรายละเอียดที่เลือก" : "กรอกข้อมูลเพื่อเพิ่มรายละเอียดใหม่"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(submit)} noValidate>
                    <FieldGroup className="mb-5">
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
                        <Field data-invalid={!!errors.detail_descriptions}>
                            <FieldLabel htmlFor="detail_descriptions">รายละเอียด</FieldLabel>
                            <Textarea
                                id="detail_descriptions"
                                placeholder="รายละเอียด"
                                aria-invalid={!!errors.detail_descriptions}
                                {...register("detail_descriptions")}
                            />
                            <FieldError errors={[errors.detail_descriptions]} />
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
