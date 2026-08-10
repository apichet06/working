

import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { getWorkingMasterFormSchema, type WorkingMasterFormValues } from "../lib/working.schema"
import { shouldUseDieAndMachine } from "../lib/department-rules"
import { WorkingMaster } from "../type"
import { JobCode } from "@/app/features/job-code/type"
import { CategoryCode } from "@/app/features/category-code/type"
import { PartCode } from "@/app/features/part-code/type"
import { DieCode } from "@/app/features/die-code/type"
import { MachineCode } from "@/app/features/machine-code/type"
import { useAuth } from "@/app/features/login/context/auth-context"

type Option = { value: string; label: string }

type WorkingFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    workingItem?: WorkingMaster | null
    jobCodes: JobCode[]
    categoryCodes: CategoryCode[]
    partCodes: PartCode[]
    dieCodes: DieCode[]
    machineCodes: MachineCode[]
    mfgNoList: string[]
    onSubmit: (values: WorkingMasterFormValues) => Promise<void>
}

export default function WorkingForm({
    open,
    onOpenChange,
    workingItem,
    jobCodes,
    categoryCodes,
    partCodes,
    dieCodes,
    machineCodes,
    mfgNoList,
    onSubmit,
}: WorkingFormProps) {
    const isEdit = !!workingItem
    const { user } = useAuth()
    const useDieAndMachineSelect = shouldUseDieAndMachine(user?.d_id)

    const jobOptions = useMemo<Option[]>(
        () => jobCodes.map((job) => ({ value: String(job.job_id), label: `${job.job_code} - ${job.job_descriptions}` })),
        [jobCodes]
    )
    const categoryOptions = useMemo<Option[]>(
        () => categoryCodes.map((category) => ({ value: String(category.cc_id), label: `${category.cc_code} - ${category.cc_descriptions}` })),
        [categoryCodes]
    )
    const partOptions = useMemo<Option[]>(
        () => partCodes.map((part) => ({ value: String(part.part_id), label: `${part.part_code} - ${part.part_descriptions}` })),
        [partCodes]
    )
    const dieOptions = useMemo<Option[]>(
        () => dieCodes.map((die) => ({ value: die.die_code, label: `${die.die_code} - ${die.die_descriptions}` })),
        [dieCodes]
    )
    const projectNoOptions = useMemo<Option[]>(
        () => mfgNoList.map((mfgNo) => ({ value: mfgNo, label: mfgNo })),
        [mfgNoList]
    )
    const machineOptions = useMemo<Option[]>(
        () => machineCodes.map((machine) => ({ value: String(machine.mac_id), label: `${machine.mac_code} - ${machine.mac_descriptions}` })),
        [machineCodes]
    )

    const getDefaultMacId = (item?: WorkingMaster | null) => {
        if (item?.mac_id) return String(item.mac_id)
        if (machineOptions.length === 1) return machineOptions[0].value
        return ""
    }

    const getDefaultJobId = (item?: WorkingMaster | null) => {
        if (item?.job_id) return String(item.job_id)
        if (jobOptions.length === 1) return jobOptions[0].value
        return ""
    }

    const getDefaultCcId = (item?: WorkingMaster | null) => {
        if (item?.cc_id) return String(item.cc_id)
        if (categoryOptions.length === 1) return categoryOptions[0].value
        return ""
    }

    const getDefaultPartId = (item?: WorkingMaster | null) => {
        if (item?.part_id) return String(item.part_id)
        if (partOptions.length === 1) return partOptions[0].value
        return ""
    }

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<WorkingMasterFormValues>({
        resolver: zodResolver(getWorkingMasterFormSchema(useDieAndMachineSelect)),
        defaultValues: {
            job_id: getDefaultJobId(workingItem),
            cc_id: getDefaultCcId(workingItem),
            part_id: getDefaultPartId(workingItem),
            mac_id: getDefaultMacId(workingItem),
            w_project_no: workingItem?.w_project_no ?? "",
            w_desc: workingItem?.w_desc ?? "",
        },
    })

    useEffect(() => {
        if (!open) return
        reset({
            job_id: getDefaultJobId(workingItem),
            cc_id: getDefaultCcId(workingItem),
            part_id: getDefaultPartId(workingItem),
            mac_id: getDefaultMacId(workingItem),
            w_project_no: workingItem?.w_project_no ?? "",
            w_desc: workingItem?.w_desc ?? "",
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, workingItem, reset, machineOptions, jobOptions, categoryOptions, partOptions])

    const submit = async (values: WorkingMasterFormValues) => {
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

    if (!open) return null

    return (
        <Card>
            <CardHeader>
                <p className="font-medium">{isEdit ? "แก้ไขงาน" : "เพิ่มงาน"}</p>
                <p className="text-sm text-muted-foreground">
                    {isEdit ? "แก้ไขข้อมูลงานที่เลือก" : "กรอกข้อมูลเพื่อเพิ่มงานใหม่"}
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(submit)} noValidate>
                    <div className="mb-5 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[2fr_1fr]">
                        <FieldGroup className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                            <Field data-invalid={!!errors.w_project_no}>
                                <FieldLabel htmlFor="w_project_no">
                                    {useDieAndMachineSelect ? "รหัสดาย(Die No)" : "เลขที่โปรเจกต์(Product No)"}
                                </FieldLabel>
                                <Controller
                                    control={control}
                                    name="w_project_no"
                                    render={({ field }) => {
                                        const options = useDieAndMachineSelect ? dieOptions : projectNoOptions
                                        const selected = options.find((option) => option.value === field.value) ?? null
                                        return (
                                            <Combobox
                                                items={options}
                                                value={selected}
                                                onValueChange={(option: Option | null) => field.onChange(option?.value ?? "")}
                                            >
                                                <ComboboxInput
                                                    id="w_project_no"
                                                    className="w-full"
                                                    placeholder={useDieAndMachineSelect ? "ค้นหารหัสดาย..." : "ค้นหาเลขที่โปรเจกต์..."}
                                                    aria-invalid={!!errors.w_project_no}
                                                    showClear
                                                />
                                                <ComboboxContent>
                                                    <ComboboxEmpty>{useDieAndMachineSelect ? "ไม่พบรหัสดาย" : "ไม่พบเลขที่โปรเจกต์"}</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {(option: Option) => (
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
                                <FieldError errors={[errors.w_project_no]} />
                            </Field>
                            <Field data-invalid={!!errors.job_id}>
                                <FieldLabel htmlFor="job_id">งาน (Job Code)</FieldLabel>
                                <Controller
                                    control={control}
                                    name="job_id"
                                    render={({ field }) => {
                                        const selected = jobOptions.find((option) => option.value === field.value) ?? null
                                        return (
                                            <Combobox
                                                items={jobOptions}
                                                value={selected}
                                                onValueChange={(option: Option | null) => field.onChange(option?.value ?? "")}
                                            >
                                                <ComboboxInput id="job_id" className="w-full" placeholder="ค้นหางาน..." aria-invalid={!!errors.job_id} showClear />
                                                <ComboboxContent>
                                                    <ComboboxEmpty>ไม่พบงาน</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {(option: Option) => (
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
                                <FieldError errors={[errors.job_id]} />
                            </Field>

                            <Field data-invalid={!!errors.cc_id}>
                                <FieldLabel htmlFor="cc_id">หมวดหมู่ (Category Code)</FieldLabel>
                                <Controller
                                    control={control}
                                    name="cc_id"
                                    render={({ field }) => {
                                        const selected = categoryOptions.find((option) => option.value === field.value) ?? null
                                        return (
                                            <Combobox
                                                items={categoryOptions}
                                                value={selected}
                                                onValueChange={(option: Option | null) => field.onChange(option?.value ?? "")}
                                            >
                                                <ComboboxInput id="cc_id" className="w-full" placeholder="ค้นหาหมวดหมู่..." aria-invalid={!!errors.cc_id} showClear />
                                                <ComboboxContent>
                                                    <ComboboxEmpty>ไม่พบหมวดหมู่</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {(option: Option) => (
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
                                <FieldError errors={[errors.cc_id]} />
                            </Field>

                            <Field data-invalid={!!errors.part_id}>
                                <FieldLabel htmlFor="part_id">ชิ้นงาน (Part Code)</FieldLabel>
                                <Controller
                                    control={control}
                                    name="part_id"
                                    render={({ field }) => {
                                        const selected = partOptions.find((option) => option.value === field.value) ?? null
                                        return (
                                            <Combobox
                                                items={partOptions}
                                                value={selected}
                                                onValueChange={(option: Option | null) => field.onChange(option?.value ?? "")}
                                            >
                                                <ComboboxInput id="part_id" className="w-full" placeholder="ค้นหาชิ้นงาน..." aria-invalid={!!errors.part_id} showClear />
                                                <ComboboxContent>
                                                    <ComboboxEmpty>ไม่พบชิ้นงาน</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {(option: Option) => (
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
                                <FieldError errors={[errors.part_id]} />
                            </Field>


                            <Field data-invalid={!!errors.mac_id}>
                                <FieldLabel htmlFor="mac_id">เครื่องจักร (Machine Code)</FieldLabel>
                                <Controller
                                    control={control}
                                    name="mac_id"
                                    render={({ field }) => {
                                        const selected = machineOptions.find((option) => option.value === field.value) ?? null
                                        return (
                                            <Combobox
                                                items={machineOptions}
                                                value={selected}
                                                onValueChange={(option: Option | null) => field.onChange(option?.value ?? "")}
                                            >
                                                <ComboboxInput id="mac_id" className="w-full" placeholder="ค้นหาเครื่องจักร..." aria-invalid={!!errors.mac_id} showClear />
                                                <ComboboxContent>
                                                    <ComboboxEmpty>ไม่พบเครื่องจักร</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {(option: Option) => (
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
                                <FieldError errors={[errors.mac_id]} />
                            </Field>

                        </FieldGroup>

                        <Field className="h-full" data-invalid={!!errors.w_desc}>
                            <FieldLabel htmlFor="w_desc">รายละเอียด(Detail)</FieldLabel>
                            <Textarea
                                id="w_desc"
                                placeholder="รายละเอียดงาน"
                                aria-invalid={!!errors.w_desc}
                                {...register("w_desc")}
                                className="h-full min-h-25 resize-none"
                            />
                            <FieldError errors={[errors.w_desc]} />
                        </Field>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
