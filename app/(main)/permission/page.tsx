import Image from "next/image"
import { Activity, ShieldCheck, User, UserCog } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { VariantProps } from "class-variance-authority"
import { type Role, sidebarItems } from "@/navigation/sidebar/sidebar-items"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

interface RoleGuide {
    role: Role
    label: string
    description: string
    badgeVariant: BadgeVariant
    icon: typeof ShieldCheck
    image: { src: string; width: number; height: number; alt: string }
}

const roleGuides: RoleGuide[] = [
    {
        role: "admin",
        label: "Admin",
        description:
            "สิทธิ์สูงสุด เห็นทุกเมนู เลือกดู Project Monitor ได้ทุกแผนก รวมถึงรายงานและเมนูจัดการข้อมูลหลักของระบบ (Job Code, Part Code, Category Code, Die No, Machine Code)",
        badgeVariant: "default",
        icon: ShieldCheck,
        image: { src: "/permission/menu_admin.png", width: 253, height: 648, alt: "เมนู Sidebar สำหรับ Admin" },
    },
    {
        role: "subadmin",
        label: "Subadmin",
        description:
            "ผู้ดูแลระดับรอง เห็นเมนูบันทึกงานและรายงาน เลือกดู Project Monitor ได้ทุกแผนก แต่ไม่มีเมนูจัดการข้อมูลหลัก (การจัดการ)",
        badgeVariant: "secondary",
        icon: UserCog,
        image: { src: "/permission/menu_subadmin.png", width: 253, height: 645, alt: "เมนู Sidebar สำหรับ Subadmin" },
    },
    {
        role: "guest",
        label: "User ทั่วไป",
        description:
            "ผู้ใช้งานทั่วไป เห็นเมนูที่จำเป็นสำหรับบันทึกและตรวจสอบงาน โดย Project Monitor จะแสดงเฉพาะแผนกของตนเอง และไม่สามารถเลือกดูแผนกอื่นได้",
        badgeVariant: "outline",
        icon: User,
        image: { src: "/permission/menu_guest.png", width: 251, height: 646, alt: "เมนู Sidebar สำหรับ User ทั่วไป" },
    },
]

// อ่านรายชื่อเมนูที่แต่ละสิทธิ์มองเห็นจริง จาก sidebar-items.ts โดยตรง
// เพื่อให้หน้านี้ไม่ต้องแก้ตามมือทุกครั้งที่มีการเพิ่ม/ลดเมนูหรือปรับสิทธิ์
function getVisibleMenuLabels(role: Role): string[] {
    const labels: string[] = []
    for (const group of sidebarItems) {
        for (const item of group.items) {
            if (item.subItems) {
                const visibleSubItems = item.subItems.filter((sub) => sub.roles?.includes(role))
                if (visibleSubItems.length > 0) {
                    labels.push(`${item.title} (${visibleSubItems.map((sub) => sub.title).join(", ")})`)
                }
            } else if (item.roles?.includes(role)) {
                labels.push(item.title)
            }
        }
    }
    return labels
}

export default function Permission() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl font-semibold">สิทธิ์การเข้าใช้งาน</h1>
                <p className="text-sm text-muted-foreground">
                    ระบบมีสิทธิ์การเข้าใช้งาน 3 ระดับ แต่ละระดับจะมองเห็นเมนูใน Sidebar ต่างกัน ตามภาพประกอบด้านล่าง
                    ใช้เป็นไกด์ไลน์ให้เข้าใจขอบเขตการใช้งานของแต่ละบทบาท
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {roleGuides.map(({ role, label, description, badgeVariant, icon: Icon, image }) => (
                    <Card key={role}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Icon className="size-4" />
                                {label}
                                <Badge variant={badgeVariant} className="ml-auto">
                                    {role}
                                </Badge>
                            </CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                width={image.width}
                                height={image.height}
                                className="mx-auto h-auto w-full max-w-55 rounded-md ring-1 ring-foreground/10"
                            />
                            <ul className="flex flex-col gap-1 text-sm">
                                {getVisibleMenuLabels(role).map((menuLabel) => (
                                    <li key={menuLabel} className="flex items-start gap-2">
                                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground/50" />
                                        {menuLabel}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="size-4 text-emerald-600" />
                        สิทธิ์ Project Monitor
                    </CardTitle>
                    <CardDescription>
                        ขอบเขตการดูกราฟกำลังทำงานแบบ realtime และเวลาสะสมของ Project
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border p-3">
                        <p className="font-medium">Admin</p>
                        <p className="mt-1 text-sm text-muted-foreground">เลือกดูได้ทุกแผนกที่มีงานอยู่</p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="font-medium">Subadmin</p>
                        <p className="mt-1 text-sm text-muted-foreground">เลือกดูได้ทุกแผนกที่มีงานอยู่</p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="font-medium">User ทั่วไป</p>
                        <p className="mt-1 text-sm text-muted-foreground">ดูได้เฉพาะแผนกของตนเอง ไม่มีตัวเลือกเปลี่ยนแผนก</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
