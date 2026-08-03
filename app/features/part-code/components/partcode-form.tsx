

import { useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { PartCodeFormSchema, type PartCodeFormValues } from "../lib/partcode_schema"
import { PartCode } from "../type"

type PartCodeFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    partCode?: PartCode | null
    onSubmit: (values: PartCodeFormValues) => Promise<void>
}

export default function PartCodeForm({ open, onOpenChange, partCode, onSubmit }: PartCodeFormProps) {
    const isEdit = !!partCode

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PartCodeFormValues>({
        resolver: zodResolver(PartCodeFormSchema),
        defaultValues: {
            part_code: partCode?.part_code ?? "",
            part_descriptions: partCode?.part_descriptions ?? "",
        },
    })

    useEffect(() => {
        if (!open) return
        reset({
            part_code: partCode?.part_code ?? "",
            part_descriptions: partCode?.part_descriptions ?? "",
        })
    }, [open, partCode, reset])

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
                                placeholder="เช่น 1001"
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
