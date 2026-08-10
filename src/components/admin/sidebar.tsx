"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/src/components/ui/link";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  GraduationCap,
  NotepadText,
  Bell,
  Video,
  UserCheck,
  MonitorPlay,
  Handshake,
  FileText,
  Command,
  ListChecks,
  LineChart,
  BookCheckIcon,
  PhoneCall,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar, // <-- Imported useSidebar here
} from "@/src/components/ui/sidebar";
import { UserRole } from "@/src/lib/auth/types/auth.types";
import { ScrollArea } from "../ui/scroll-area";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: string[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        allowedRoles: ["admin"],
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
        allowedRoles: ["admin"],
      },
    ],
  },
  {
    label: "Academics",
    items: [
      {
        label: "Courses",
        href: "/admin/courses",
        icon: BookOpen,
        allowedRoles: ["admin"],
      },
      {
        label: "Batches",
        href: "/admin/batches",
        icon: Layers,
        allowedRoles: ["admin"],
      },
      {
        label: "Enrollments",
        href: "/admin/enrollments",
        icon: GraduationCap,
        allowedRoles: ["admin"],
      },
      {
        label: "Tests",
        href: "/admin/tests",
        icon: NotepadText,
        allowedRoles: ["admin", "teacher"],
      },
      {
        label: "Question Papers",
        href: "/admin/question-papers",
        icon: FileText,
        allowedRoles: ["admin"],
      },
      {
        label: "Syllabus Progress",
        href: "/admin/syllabus-progress",
        icon: ListChecks,
        allowedRoles: ["admin", "teacher"],
      },
      {
        label: "Student Progress",
        href: "/admin/student-progress",
        icon: LineChart,
        allowedRoles: ["admin", "teacher"],
      },
    ],
  },
  {
    label: "Interactive",
    items: [
      {
        label: "Live Classes",
        href: "/admin/live-classes",
        icon: Video,
        allowedRoles: ["admin", "teacher"],
      },
      {
        label: "Mentorship Sessions",
        href: "/admin/mentorship_sessions",
        icon: Handshake,
        allowedRoles: ["admin", "teacher"],
      },
      {
        label: "Group Sessions",
        href: "/admin/group-sessions",
        icon: MonitorPlay,
        allowedRoles: ["admin", "teacher"],
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Attendance",
        href: "/admin/attendance",
        icon: UserCheck,
        allowedRoles: ["admin", "teacher"],
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
        allowedRoles: ["admin", "teacher"],
      },
      {
        label: "Leads",
        href: "/admin/leads",
        icon: PhoneCall,
        allowedRoles: ["admin"],
      },
    ],
  },
];

export default function AdminSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname();
  const normalizedRole = String(userRole).toLowerCase();

  // <-- Extract setOpenMobile and isMobile from the hook
  const { setOpenMobile, isMobile } = useSidebar();

  // Filter items by role, and exclude groups that end up with 0 visible items
  const visibleNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.allowedRoles.map((r) => r.toLowerCase()).includes(normalizedRole),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r z-50">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">T1 classes</span>
                <span className="truncate text-xs">Admin Portal</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Wrapped the content in Shadcn's ScrollArea */}
        <ScrollArea className="h-full">
          {visibleNavGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === pathname;

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <Link
                            href={item.href}
                            // <-- ADD THIS ONCLICK HANDLER
                            onClick={() => {
                              if (isMobile) {
                                setOpenMobile(false);
                              }
                            }}
                          >
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
