"use client";

import {
  BookOpen,
  GraduationCap,
  UserCheck,
  UserCog,
  Users,
  UserX,
} from "lucide-react";
import { DashboardKPIs } from "../hooks/use-dashboard-kpis";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

export function UsersOverviewStat({ data }: { data: DashboardKPIs["users"] }) {
  return (
    <Card className="h-54 shadow-none gap-1 py-1">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <Users className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              User Demographics
            </h3>
            <p className="text-xs text-muted-foreground">
              Total: {data.total} registered users
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6 p-5 pt-0">
        {/* Left Column: Roles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <UserCog className="size-3.5" /> Admins
            </span>
            <span className="text-sm font-bold">{data.roles.admins}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <BookOpen className="size-3.5" /> Teachers
            </span>
            <span className="text-sm font-bold">{data.roles.teachers}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <GraduationCap className="size-3.5" /> Students
            </span>
            <span className="text-sm font-bold">{data.roles.students}</span>
          </div>
        </div>

        {/* Right Column: Statuses */}
        <div className="space-y-3 border-l pl-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <UserCheck className="size-3.5" /> Active
            </span>
            <span className="text-sm font-bold">{data.statuses.active}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Users className="size-3.5" /> Invited
            </span>
            <span className="text-sm font-bold">{data.statuses.invited}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
              <UserX className="size-3.5" /> Blocked
            </span>
            <span className="text-sm font-bold">{data.statuses.blocked}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
