

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
import { CategoryCodeFormSchema, type CategoryCodeFormValues } from "../lib/category_schema"
import { CategoryCode } from "../type"

type CategoryCodeFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    categoryCode?: CategoryCode | null
    onSubmit: (values: CategoryCodeFormValues) => Promise<void>
}

export default function CategoryCodeForm({ open, onOpenChange, categoryCode, onSubmit }: CategoryCodeFormProps) {
    const isEdit = !!categoryCode

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CategoryCodeFormValues>({
        resolver: zodResolver(CategoryCodeFormSchema),
        defaultValues: {
            cc_code: categoryCode?.cc_code ?? "",
            cc_descriptions: categoryCode?.cc_descriptions ?? "",
        },
    })

    useEffect(() => {
        if (!open) return
        reset({
            cc_code: categoryCode?.cc_code ?? "",
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
