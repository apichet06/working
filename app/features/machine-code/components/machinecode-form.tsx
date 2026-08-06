

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
import { MachineCodeFormSchema, type MachineCodeFormValues } from "../lib/machine_schema"
import { MachineCode, Department } from "../type"

type DepartmentOption = { value: string; label: string }

type MachineCodeFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    machineCode?: MachineCode | null
    departments: Department[]
    onSubmit: (values: MachineCodeFormValues) => Promise<void>
}

export default function MachineCodeForm({ open, onOpenChange, machineCode, departments, onSubmit }: MachineCodeFormProps) {
    const isEdit = !!machineCode

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
    } = useForm<MachineCodeFormValues>({
        resolver: zodResolver(MachineCodeFormSchema),
        defaultValues: {
            mac_code: machineCode?.mac_code ?? "",
            dp_id: machineCode?.dp_id ? String(machineCode.dp_id) : "",
            mac_descriptions: machineCode?.mac_descriptions ?? "",
        },
    })

    useEffect(() => {
        if (!open) return
        reset({
            mac_code: machineCode?.mac_code ?? "",
            dp_id: machineCode?.dp_id ? String(machineCode.dp_id) : "",
            mac_descriptions: machineCode?.mac_descriptions ?? "",
        })
    }, [open, machineCode, reset])

    const submit = async (values: MachineCodeFormValues) => {
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
                    <DialogTitle>{isEdit ? "แก้ไขรหัสเครื่องจักร" : "เพิ่มรหัสเครื่องจักร"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "แก้ไขข้อมูลรหัสเครื่องจักรที่เลือก" : "กรอกข้อมูลเพื่อเพิ่มรหัสเครื่องจักรใหม่"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(submit)} noValidate>
                    <FieldGroup className="mb-5">
                        <Field data-invalid={!!errors.mac_code}>
                            <FieldLabel htmlFor="mac_code">รหัสเครื่องจักร</FieldLabel>
                            <Input
                                id="mac_code"
                                type="text"
                                placeholder="เช่น 111"
                                aria-invalid={!!errors.mac_code}
                                {...register("mac_code")}
                                maxLength={7}
                            />
                            <FieldError errors={[errors.mac_code]} />
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
                        <Field data-invalid={!!errors.mac_descriptions}>
                            <FieldLabel htmlFor="mac_descriptions">รายละเอียด</FieldLabel>
                            <Textarea
                                id="mac_descriptions"
                                placeholder="รายละเอียดรหัสเครื่องจักร"
                                aria-invalid={!!errors.mac_descriptions}
                                {...register("mac_descriptions")}
                            />
                            <FieldError errors={[errors.mac_descriptions]} />
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
