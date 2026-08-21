

import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
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
import { docter_project_code_service } from "@/app/features/docter-project-code/lib/docter_project_code_service"

type Option = { value: string; label: string }

// ช่วย user auto-select หมวดหมู่จากเลขที่โปรเจกต์ (Product No) กันเลือกหมวดหมู่ผิด
// รหัสจริงมีตัวอักษร/ตัวเลขแทรกกลางได้เรื่อยๆ (เช่น CJ66-1, KMB86-1) เลยดูแค่:
// - ตัวอักษรตัวเดียวที่ตำแหน่ง 1 ปกติ หรือตำแหน่ง 2 ถ้าตัวแรกเป็น K (ข้าม K ไป)
// - เลขท้ายสุดหลังขีดสุดท้าย (ไม่สนใจตัวอักษร/ตัวเลขที่แทรกอยู่ตรงกลาง)
//
// กรณีพิเศษ: ขึ้นต้นด้วย N หรือ KN -> ใช้เลขท้ายเป็น category code ตรงๆ เลย
// (N...-1 = NEW DIE(1), N...-2 = MODIFY(2), N...-3 = CLAIM,REPAIR(3) ฯลฯ ตามตาราง CATEGORY CODE)
// ตัวอักษรอื่น (P/C/M/D) ยัง fix ตายตัวตามตาราง BP/KR เดิม
// ไม่ตรงเงื่อนไขไหนเลย (รวม MEETING/OTHER) -> fallback ไปที่ OTHER (9)
const CATEGORY_CODES = new Set(["1", "2", "3", "5", "6", "7", "9"])

const PROJECT_NO_CATEGORY_RULES: { letter: string; ccCode: string }[] = [
    { letter: "P", ccCode: "1" }, // PART
    { letter: "C", ccCode: "5" }, // CORE PIN
    { letter: "M", ccCode: "2" }, // MODIFY
    { letter: "D", ccCode: "6" }, // DATA
]

function matchCategoryCodeFromProjectNo(value: string): string {
    const upper = value.toUpperCase()

    // เฉพาะ N/KN เท่านั้นที่สนใจเลขท้าย ตัวอักษรอื่นดูแค่ตัวอักษรพอ ไม่สนใจเลขท้าย
    if (upper.startsWith("N") || upper.startsWith("KN")) {
        const suffix = upper.match(/-(\d+)$/)?.[1] ?? ""
        return CATEGORY_CODES.has(suffix) ? suffix : "9"
    }

    const letterIndex = upper.startsWith("K") ? 1 : 0
    const letter = upper[letterIndex] ?? ""
    const rule = PROJECT_NO_CATEGORY_RULES.find((r) => r.letter === letter)
    return rule?.ccCode ?? "9"
}

type WorkingFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    workingItem?: WorkingMaster | null
    jobCodes: JobCode[]
    categoryCodes: CategoryCode[]
    partCodes: PartCode[]
    dieCodes: DieCode[]
    machineCodes: MachineCode[]
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
    onSubmit,
}: WorkingFormProps) {
    const isEdit = !!workingItem
    const { user } = useAuth()
    const useDieAndMachineSelect = shouldUseDieAndMachine(user?.d_id)

    // sort ด้วย numeric: true กัน code ที่เป็นตัวเลขเรียงแบบ string ผิด (เช่น "10" มาก่อน "2")
    const jobOptions = useMemo<Option[]>(
        () => [...jobCodes]
            .sort((a, b) => String(a.job_code).localeCompare(String(b.job_code), undefined, { numeric: true }))
            .map((job) => ({ value: String(job.job_id), label: `${job.job_code} - ${job.job_descriptions}` })),
        [jobCodes]
    )
    const categoryOptions = useMemo<Option[]>(
        () => [...categoryCodes]
            .sort((a, b) => String(a.cc_code).localeCompare(String(b.cc_code), undefined, { numeric: true }))
            .map((category) => ({ value: String(category.cc_id), label: `${category.cc_code} - ${category.cc_descriptions}` })),
        [categoryCodes]
    )
    const partOptions = useMemo<Option[]>(
        () => [...partCodes]
            .sort((a, b) => String(a.part_code).localeCompare(String(b.part_code), undefined, { numeric: true }))
            .map((part) => ({ value: String(part.part_id), label: `${part.part_code} - ${part.part_descriptions}` })),
        [partCodes]
    )
    const dieOptions = useMemo<Option[]>(
        () => [...dieCodes]
            .sort((a, b) => String(a.die_code).localeCompare(String(b.die_code), undefined, { numeric: true }))
            .map((die) => ({ value: die.die_code, label: `${die.die_code} - ${die.die_descriptions}` })),
        [dieCodes]
    )
    // เลขที่โปรเจกต์ (Product No) ดึงจาก Oracle เป็นแสนรายการ โหลดมาทั้งหมดแล้วช้ามาก
    // เลยค้นหาแบบพิมพ์แล้วยิง API ถามใหม่ทุกครั้ง (debounce) แทนที่จะโหลดมา filter เองฝั่ง client
    const [projectNoOptions, setProjectNoOptions] = useState<Option[]>([])
    const [projectNoSearching, setProjectNoSearching] = useState(false)
    const projectNoSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    const searchProjectNo = (term: string) => {
        if (projectNoSearchTimeout.current) clearTimeout(projectNoSearchTimeout.current)
        const trimmed = term.trim()
        if (trimmed.length < 2) {
            setProjectNoOptions([])
            setProjectNoSearching(false)
            return
        }

        // รหัสดาย (dieOptions) มีอยู่ในเครื่องแล้ว ไม่ต้องรอ debounce/ยิง API ก็ค้นหาได้เลย
        // โชว์รวมกับผลลัพธ์เลขที่โปรเจกต์จาก Oracle ในช่องเดียวกัน
        const matchedDieOptions = dieOptions.filter((option) =>
            option.label.toLowerCase().includes(trimmed.toLowerCase())
        )
        setProjectNoOptions(matchedDieOptions)

        // ตั้ง loading ไว้ตั้งแต่ก่อน debounce จะยิงจริง ผู้ใช้จะได้เห็นว่ากำลังทำงานอยู่ตลอด
        // ไม่ใช่แค่ตอน network call เท่านั้น กัน "ไม่พบเลขที่โปรเจกต์" โผล่มาหลอกว่ายังไม่เจอจริงๆ
        setProjectNoSearching(true)
        projectNoSearchTimeout.current = setTimeout(async () => {
            try {
                const results = await docter_project_code_service.listMfgNo(term)
                setProjectNoOptions([
                    ...matchedDieOptions,
                    ...results.map((mfgNo) => ({ value: mfgNo, label: mfgNo })),
                ])
            } catch (err) {
                // ใช้ warn ไม่ใช่ error เพราะ error ตัวนี้ถูก handle ไว้แล้ว (fallback เหลือรหัสดายที่ค้นเจอในเครื่อง)
                // console.error จะโดน Next.js dev overlay ดักโชว์เป็น error overlay เต็มจอทั้งที่ไม่ได้พังอะไร
                console.warn("ค้นหาเลขที่โปรเจกต์ไม่สำเร็จ:", err)
            } finally {
                setProjectNoSearching(false)
            }
        }, 300)
    }

    // ตอนเปิดฟอร์มแก้ไขงานที่มีเลขที่โปรเจกต์อยู่แล้ว ต้อง seed option นั้นไว้ก่อน ไม่งั้นจะไม่มี
    // label ให้โชว์จนกว่าจะพิมพ์ค้นหาเอง - ปรับ state ระหว่าง render ตรงๆ กัน cascading render
    const [trackedProjectNo, setTrackedProjectNo] = useState(workingItem?.w_project_no)
    if (workingItem?.w_project_no !== trackedProjectNo) {
        setTrackedProjectNo(workingItem?.w_project_no)
        if (workingItem?.w_project_no) {
            const projectNo = workingItem.w_project_no
            setProjectNoOptions((prev) =>
                prev.some((option) => option.value === projectNo)
                    ? prev
                    : [{ value: projectNo, label: projectNo }, ...prev]
            )
        }
    }

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
        setValue,
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
                                {useDieAndMachineSelect ? (
                                    <Controller
                                        control={control}
                                        name="w_project_no"
                                        render={({ field }) => {
                                            const selected = dieOptions.find((option) => option.value === field.value) ?? null
                                            return (
                                                <Combobox
                                                    items={dieOptions}
                                                    value={selected}
                                                    onValueChange={(option: Option | null) => field.onChange(option?.value ?? "")}
                                                >
                                                    <ComboboxInput
                                                        id="w_project_no"
                                                        className="w-full"
                                                        placeholder="ค้นหารหัสดาย..."
                                                        aria-invalid={!!errors.w_project_no}
                                                        showClear
                                                    />
                                                    <ComboboxContent>
                                                        <ComboboxEmpty>ไม่พบรหัสดาย</ComboboxEmpty>
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
                                ) : (
                                    <Controller
                                        control={control}
                                        name="w_project_no"
                                        render={({ field }) => {
                                            const selected = projectNoOptions.find((option) => option.value === field.value) ?? null
                                            return (
                                                <Combobox
                                                    items={projectNoOptions}
                                                    limit={50}
                                                    value={selected}
                                                    onInputValueChange={(inputValue) => searchProjectNo(inputValue)}
                                                    onValueChange={(option: Option | null) => {
                                                        field.onChange(option?.value ?? "")
                                                        if (!option) return
                                                        // ถ้าตัวเลือกที่กดมาจากรหัสดาย (ไม่ใช่เลขที่โปรเจกต์จาก Oracle) รูปแบบจะไม่ตรงกับ
                                                        // ที่ matchCategoryCodeFromProjectNo คาดไว้ เลยให้เป็นหมวดหมู่ OTHER (9) ไปเลย
                                                        const isFromDieNo = dieOptions.some((die) => die.value === option.value)
                                                        const ccCode = isFromDieNo ? "9" : matchCategoryCodeFromProjectNo(option.value)
                                                        const matchedCategory = categoryCodes.find((category) => category.cc_code === ccCode)
                                                        if (matchedCategory) {
                                                            setValue("cc_id", String(matchedCategory.cc_id), { shouldValidate: true, shouldDirty: true })
                                                        }

                                                        // แผนก 1, 3: เลือกรหัสดาย (Die No) แล้ว auto-select งาน (1080) และชิ้นงาน (903) ให้
                                                        // ถ้าไม่มีรหัสนั้นให้เลือก ปล่อยให้ user เลือกเอง ไม่ต้อง auto-select
                                                        if (isFromDieNo && (user?.d_id === 1 || user?.d_id === 3)) {
                                                            const matchedJob = jobCodes.find((job) => job.job_code === "1080")
                                                            if (matchedJob) {
                                                                setValue("job_id", String(matchedJob.job_id), { shouldValidate: true, shouldDirty: true })
                                                            }
                                                            const matchedPart = partCodes.find((part) => part.part_code === "903")
                                                            if (matchedPart) {
                                                                setValue("part_id", String(matchedPart.part_id), { shouldValidate: true, shouldDirty: true })
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <ComboboxInput
                                                        id="w_project_no"
                                                        className="w-full"
                                                        placeholder="พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา..."
                                                        aria-invalid={!!errors.w_project_no}
                                                        showClear
                                                    />
                                                    <ComboboxContent>
                                                        <ComboboxEmpty>
                                                            {projectNoSearching ? (
                                                                <span className="flex items-center gap-2">
                                                                    <Spinner /> กำลังค้นหา...
                                                                </span>
                                                            ) : (
                                                                "ไม่พบเลขที่โปรเจกต์"
                                                            )}
                                                        </ComboboxEmpty>
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
                                )}
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
