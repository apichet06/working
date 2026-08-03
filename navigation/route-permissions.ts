// src/navigation/route-permissions.ts
import { sidebarItems, type Role } from "@/navigation/sidebar/sidebar-items";

// ถ้าไม่ได้กำหนด roles ให้เมนูนั้น → default ให้ทุก role เข้าได้
const DEFAULT_ROLES: Role[] = ["admin", "subadmin", "guest"];

export function getRolesForPath(pathname: string): Role[] {
    for (const group of sidebarItems) {
        for (const item of group.items) {
            // ตรงกับเมนูหลัก
            if (pathname.startsWith(item.url as string)) {
                return item.roles ?? DEFAULT_ROLES;
            }

            // ตรงกับ sub item
            if (item.subItems) {
                for (const sub of item.subItems) {
                    if (pathname.startsWith(sub.url)) {
                        return sub.roles ?? item.roles ?? DEFAULT_ROLES;
                    }
                }
            }
        }
    }

    // ถ้า path ไม่อยู่ในเมนูเลย → จะเลือกเองว่า:
    // - จะให้ทุก role login แล้วเข้ได้
    // - หรือให้เฉพาะ admin (ก็ได้)
    return DEFAULT_ROLES;
}
