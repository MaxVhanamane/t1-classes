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
} from "@/src/components/ui/sidebar";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Users", href: "/admin/users", icon: Users },
    ],
  },
  {
    label: "Academics",
    items: [
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Batches", href: "/admin/batches", icon: Layers },
      { label: "Enrollments", href: "/admin/enrollments", icon: GraduationCap },
      { label: "Tests", href: "/admin/tests", icon: NotepadText },
      {
        label: "Question Papers",
        href: "/admin/question-papers",
        icon: FileText,
      },
      {
        label: "Syllabus Progress",
        href: "/admin/syllabus-progress",
        icon: ListChecks,
      },
    ],
  },
  {
    label: "Interactive",
    items: [
      { label: "Live Classes", href: "/admin/live-classes", icon: Video },
      {
        label: "Mentorship Sessions",
        href: "/admin/mentorship_sessions",
        icon: Handshake,
      },
      {
        label: "Group Sessions",
        href: "/admin/group-sessions",
        icon: MonitorPlay,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Attendance", href: "/admin/attendance", icon: UserCheck },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

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
        {navGroups.map((group) => (
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
                        <Link href={item.href}>
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
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
