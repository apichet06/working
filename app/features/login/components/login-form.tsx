"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { FormSchema, type FormValues } from "../service/login-schema"
import { employee_service } from "../service/login-service"
import { useAuth } from "../context/auth-context"
import { parseApiError } from "@/lib/parse-api-error"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter()
    const { login } = useAuth()
    const [formError, setFormError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
    })

    const onSubmit = async (values: FormValues) => {
        setFormError(null)
        try {
            const res = await employee_service.login(values)
            login(res.data, res.token)
            router.push("/dashboard")
        } catch (err) {
            setFormError(parseApiError(err, "เข้าสู่ระบบไม่สำเร็จ"))

        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Image
                src="/logowr_new.png"
                alt="Working Report System"
                width={130}
                height={130}
                className="mx-auto"
            />
            <Card>
                <CardHeader>
                    <CardTitle>Working Reprot System</CardTitle>
                    <CardDescription>
                        ใช้ในงานบันทึกข้อมูลการทำงานของพนักงาน CAD#CAM
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <FieldGroup>
                            <Field data-invalid={!!errors.usercode}>
                                <FieldLabel htmlFor="e_usercode">รหัสพนักงาน</FieldLabel>
                                <Input
                                    id="e_usercode"
                                    type="text"
                                    placeholder="เช่น 6912345"
                                    aria-invalid={!!errors.usercode}
                                    {...register("usercode")}
                                />
                                <FieldError errors={[errors.usercode]} />
                            </Field>
                            <Field data-invalid={!!errors.password}>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="e_password">Password</FieldLabel>
                                </div>
                                <Input
                                    id="e_password"
                                    type="password"
                                    aria-invalid={!!errors.password}
                                    {...register("password")}
                                />
                                <FieldError errors={[errors.password]} />
                            </Field>
                            {formError && <FieldError>{formError}</FieldError>}
                            <Field>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
