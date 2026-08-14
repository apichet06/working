import {
  BookType,
  ClipboardClock,
  ClipboardMinus,
  Image,
  LayoutDashboard,
  type LucideIcon,
  NotebookTabs,
  SquareChartGantt,
} from "lucide-react";
export type Role = "admin" | "subadmin" | "guest";
export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  roles?: Role[];
}

export interface NavMainItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  roles?: Role[];
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    // label: "หน้าหลัก",
    items: [
      {
        title: "หน้าหลัก",
        url: "/dashboard/",
        icon: LayoutDashboard,
        roles: ["admin", "subadmin", "guest"],
      },
    ],
  },
  {
    id: 2,
    label: "สำหรับบึนทึกงาน",
    items: [
      {
        title: "Working",
        url: "/working/",
        icon: NotebookTabs,
        comingSoon: false,
        roles: ["admin", "subadmin", "guest"],
      },
      {
        title: "Working Time (ปรับแก้เวลา)",
        url: "/working-time/",
        icon: ClipboardClock,
        roles: ["admin", "subadmin"],
      },
      {
        title: "Working Checking",
        url: "/working-checking/",
        icon: BookType,
        roles: ["admin", "subadmin", "guest"],
      },
      {
        title: "สิทธิ์การเข้าใช้งาน",
        url: "/permission/",
        icon: Image,
        roles: ["admin", "subadmin", "guest"],
      },
    ],
  },
  {
    id: 3,
    label: "รายงาน",
    items: [
      {
        title: "Working Report",
        url: "/working-report/",
        icon: ClipboardMinus,
        comingSoon: false,
        roles: ["admin", "subadmin"],
      },
    ],
  },
  {
    id: 4,
    label: "การจัดการสำรับ (Admin)",
    items: [
      {
        title: "การจัดการ",
        icon: SquareChartGantt,
        subItems: [
          {
            title: "Job Code",
            url: "/job-code/",
            newTab: false,
            roles: ["admin"],
          },
          {
            title: "Part Code",
            url: "/part-code/",
            newTab: false,
            roles: ["admin"],
          },
          {
            title: "Category Code",
            url: "/category-code/",
            newTab: false,
            roles: ["admin"],
          },
          {
            title: "Die No",
            url: "/die-code/",
            newTab: false,
            roles: ["admin"],
          },
          {
            title: "Machine Code",
            url: "/machine-code/",
            newTab: false,
            roles: ["admin"],
          },
        ],
      },
    ],
  },
];
