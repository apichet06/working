import {
    Activity,
    BookOpenCheck,
    ChartColumnBig,
    CheckCircle2,
    Clock3,
    PauseCircle,
    PlayCircle,
    RadioTower,
    ShieldCheck,
} from "lucide-react"
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function GuidePage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="flex items-center gap-2 text-xl font-semibold">
                    <BookOpenCheck className="size-5 text-emerald-600" />
                    คู่มือการใช้งาน
                </h1>
                <p className="text-sm text-muted-foreground">
                    วิธีบันทึกงานและอ่านข้อมูลใน Working Report System
                </p>
            </div>

            <section className="grid gap-4 lg:grid-cols-2">
                <GuideCard
                    icon={PlayCircle}
                    title="การบันทึกงานทั่วไป"
                    description="สำหรับแผนกที่ใช้การจับเวลาสด"
                >
                    <ol className="space-y-3 text-sm">
                        <GuideStep number="1" title="เพิ่มงาน">กรอก Project No, Job Code, Category Code, Part Code และ Detail</GuideStep>
                        <GuideStep number="2" title="เริ่มงาน">กดปุ่มเริ่มงาน ระบบจะเริ่มนับเวลาทำงานจริง</GuideStep>
                        <GuideStep number="3" title="หยุดชั่วคราว">หยุดเฉพาะรอบจับเวลา งานยังไม่ถือว่าจบและสามารถกลับมาเริ่มใหม่ได้</GuideStep>
                        <GuideStep number="4" title="จบงาน">ใช้เมื่อดำเนินงานรายการนั้นเสร็จสมบูรณ์แล้ว</GuideStep>
                    </ol>
                </GuideCard>

                <GuideCard
                    icon={Clock3}
                    title="การบันทึกเวลาของ Finishing"
                    description="บันทึกเวลาเริ่มและเวลาหยุดที่ทราบอยู่แล้ว"
                >
                    <div className="space-y-3 text-sm">
                        <p>
                            แผนก Finishing ไม่ใช้การจับเวลาสด พนักงานเลือกวันที่ เวลาเริ่ม และเวลาหยุดของงานด้วยตนเอง
                        </p>
                        <p className="rounded-lg border bg-muted/30 p-3 text-muted-foreground">
                            เวลาทำงานจริงคำนวณจาก <span className="font-medium text-foreground">เวลาหยุด − เวลาเริ่ม</span> ของแต่ละรายการที่บันทึก
                        </p>
                        <p>
                            งานแบบระบุเวลาจะรวมอยู่ในกราฟเวลาสะสม แต่จะไม่แสดงในกราฟ Realtime เพราะไม่มี timer ที่กำลังเดินอยู่
                        </p>
                    </div>
                </GuideCard>
            </section>

            <section className="space-y-3">
                <div>
                    <h2 className="text-lg font-semibold">การอ่าน Dashboard</h2>
                    <p className="text-sm text-muted-foreground">สรุปเวลาทำงานของพนักงานเป็นรายปีและรายวัน</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <GuideCard
                        icon={ChartColumnBig}
                        title="เงื่อนไขข้อมูลที่นำมาแสดง"
                        description="Dashboard เป็นข้อมูลรายบุคคล"
                    >
                        <ul className="space-y-2 text-sm">
                            <GuideBullet>ค่าเริ่มต้นแสดงข้อมูลของผู้ที่เข้าสู่ระบบ ไม่ใช่ยอดรวมทั้งแผนก</GuideBullet>
                            <GuideBullet>นับเฉพาะรอบงานที่มีเวลาเริ่มและเวลาสิ้นสุดแล้ว</GuideBullet>
                            <GuideBullet>รอบที่กำลังจับเวลาจะยังไม่ถูกรวม จนกว่าจะกดหยุดหรือจบงาน</GuideBullet>
                            <GuideBullet>ข้อมูลถูกจัดเข้าวัน เดือน และปีตามวันที่เริ่มงานของรอบนั้น</GuideBullet>
                            <GuideBullet>เวลาที่แผนก Finishing บันทึกแบบระบุเวลาเองจะถูกรวมเมื่อมีทั้งเวลาเริ่มและเวลาสิ้นสุด</GuideBullet>
                        </ul>
                    </GuideCard>

                    <GuideCard
                        icon={Clock3}
                        title="ความหมายของตัวเลขและตัวกรอง"
                        description="ใช้หลักการคำนวณเดียวกันทั้งรายปีและรายวัน"
                    >
                        <ul className="space-y-2 text-sm">
                            <GuideBullet><span className="font-medium">Labour Hours</span> คือผลรวมชั่วโมงทำงานจริงจากทุกรอบที่ปิดเวลาแล้ว</GuideBullet>
                            <GuideBullet><span className="font-medium">Job Hour (วัน)</span> คือชั่วโมงทำงานจริงรวม ÷ 24 ไม่ใช่จำนวนงานหรือจำนวนวันปฏิทิน</GuideBullet>
                            <GuideBullet>กราฟ Job Code และ Project เรียงจากชั่วโมงทำงานจริงมากไปน้อย</GuideBullet>
                            <GuideBullet>Admin และ Subadmin กรองแผนกเพื่อค้นหาและเลือกพนักงาน ส่วน User ทั่วไปดูได้เฉพาะตนเอง</GuideBullet>
                            <GuideBullet>พนักงานที่ไม่มีรอบงานสิ้นสุดในปีที่เลือกจะไม่สามารถเลือกดูได้</GuideBullet>
                        </ul>
                    </GuideCard>
                </div>
            </section>

            <section className="space-y-3">
                <div>
                    <h2 className="text-lg font-semibold">การอ่าน Project Monitor</h2>
                    <p className="text-sm text-muted-foreground">เลือกแผนกแล้วเปรียบเทียบข้อมูลจากกราฟทั้งสองแบบ</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <GuideCard
                        icon={RadioTower}
                        title="กำลังทำงานตอนนี้"
                        description="แสดงเฉพาะ Project ที่กำลังจับเวลา"
                    >
                        <ul className="space-y-2 text-sm">
                            <GuideBullet>สีเขียวหมายถึงมีพนักงานกำลังจับเวลาทำงานอยู่</GuideBullet>
                            <GuideBullet>เวลาคือผลรวมตั้งแต่แต่ละคนกดเริ่มงานจนถึงปัจจุบัน</GuideBullet>
                            <GuideBullet>เมื่อทุกคนหยุดจับเวลา Project จะหายจากกราฟนี้</GuideBullet>
                            <GuideBullet>คลิกแท่งกราฟเพื่อดูรายชื่อและรายละเอียดงานของแต่ละคน</GuideBullet>
                        </ul>
                    </GuideCard>

                    <GuideCard
                        icon={Activity}
                        title="เวลาสะสมของ Project ที่ยังทำงานอยู่"
                        description="แสดง Project ที่ยังมีรายการงานไม่จบ"
                    >
                        <ul className="space-y-2 text-sm">
                            <GuideBullet>รวมเวลาทุกรอบของทุกคน ทั้งรอบที่จบแล้วและรอบที่กำลังทำ</GuideBullet>
                            <GuideBullet><StatusDot color="green" /> สีเขียว: มีคนกำลังจับเวลา</GuideBullet>
                            <GuideBullet><StatusDot color="amber" /> สีส้ม: งานยังไม่จบ แต่ทุกคนหยุดจับเวลาอยู่</GuideBullet>
                            <GuideBullet>เมื่อทุกคนกดจบงาน Project จะหายจากกราฟ</GuideBullet>
                        </ul>
                    </GuideCard>
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <GuideCard
                    icon={PauseCircle}
                    title="การคำนวณเวลาทำงานจริง"
                    description="นับเฉพาะช่วงที่มีการทำงาน"
                >
                    <ul className="space-y-2 text-sm">
                        <GuideBullet>คำนวณแต่ละรอบจากเวลาเริ่มถึงเวลาหยุดหรือจบงาน</GuideBullet>
                        <GuideBullet>ไม่รวมช่วงที่หยุดจับเวลาอยู่ระหว่างรอบ</GuideBullet>
                        <GuideBullet>นำเวลาของพนักงานทุกคนใน Project มารวมกัน</GuideBullet>
                        <GuideBullet>ทุก 24 ชั่วโมงจะแสดงเป็น 1 วัน และเศษเวลาแสดงเป็นชั่วโมงกับนาที</GuideBullet>
                    </ul>
                </GuideCard>

                <GuideCard
                    icon={ShieldCheck}
                    title="สิทธิ์การดูข้อมูล"
                    description="ขอบเขตข้อมูลขึ้นอยู่กับบทบาทผู้ใช้"
                >
                    <div className="space-y-3 text-sm">
                        <PermissionRow role="Admin / Subadmin">เลือกดู Project Monitor ได้ทุกแผนกที่มีงาน</PermissionRow>
                        <PermissionRow role="User ทั่วไป">ดู Project Monitor ได้เฉพาะแผนกของตนเอง</PermissionRow>
                        <p className="text-xs text-muted-foreground">
                            เมนูและความสามารถอื่นอาจแตกต่างกันตามสิทธิ์ ดูรายละเอียดเพิ่มเติมได้ที่หน้า “สิทธิ์การเข้าใช้งาน”
                        </p>
                    </div>
                </GuideCard>
            </section>
        </div>
    )
}

function GuideCard({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: typeof Activity
    title: string
    description: string
    children: ReactNode
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className="size-4 text-emerald-600" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}

function GuideStep({ number, title, children }: { number: string; title: string; children: ReactNode }) {
    return (
        <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">{number}</span>
            <div><span className="font-medium">{title}:</span> {children}</div>
        </li>
    )
}

function GuideBullet({ children }: { children: ReactNode }) {
    return (
        <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span>{children}</span>
        </li>
    )
}

function StatusDot({ color }: { color: "green" | "amber" }) {
    return <span className={`inline-block size-2.5 rounded-full ${color === "green" ? "bg-green-600" : "bg-amber-600"}`} aria-hidden="true" />
}

function PermissionRow({ role, children }: { role: string; children: ReactNode }) {
    return (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
            <Badge variant="secondary">{role}</Badge>
            <span>{children}</span>
        </div>
    )
}
