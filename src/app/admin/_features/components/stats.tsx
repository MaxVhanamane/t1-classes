import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { StatCard } from "./stat-card";

const supabaseClient = async () => await createServerSupabaseClient();

export async function StudentsStat() {
  const supabase = await supabaseClient();
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .eq("status", "active");

  return <StatCard icon={Users} label="Students" value={count ?? 0} />;
}

export async function TeachersStat() {
  const supabase = await supabaseClient();
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "teacher")
    .eq("status", "active");

  return <StatCard icon={GraduationCap} label="Teachers" value={count ?? 0} />;
}
export async function AdminStat() {
  const supabase = await supabaseClient();
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("status", "active");

  return <StatCard icon={ShieldCheck} label="Admins" value={count ?? 0} />;
}

export async function EnrollmentsStat() {
  const supabase = await supabaseClient();

  const now = new Date().toISOString();

  const { count } = await supabase
    .from("enrollments")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("is_active", true)
    .lte("access_starts_at", now)
    .or(`access_ends_at.is.null,access_ends_at.gte.${now}`);

  return <StatCard icon={Layers} label="Enrollments" value={count ?? 0} />;
}

export async function CoursesStat() {
  const supabase = await supabaseClient();
  const { count } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return <StatCard icon={BookOpen} label="Courses" value={count ?? 0} />;
}

export async function BatchesStat() {
  const supabase = await supabaseClient();
  const { count } = await supabase
    .from("batches")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return <StatCard icon={Layers} label="Batches" value={count ?? 0} />;
}

function formatCurrency(value: number | null | undefined) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
}

export async function FinancialOverviewStat() {
  const supabase = await supabaseClient();

  const { data, error } = await supabase
    .from("dashboard_fee_summary")
    .select("*")
    .single();

  if (error || !data) {
    return (
      <StatCard
        icon={Wallet}
        label="Financial Overview"
        value="Unavailable"
        accent="destructive"
      />
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Wallet className="size-5 text-primary" />

        <div>
          <h3 className="text-sm font-medium">Financial Overview</h3>

          <p className="text-xs text-muted-foreground">
            Current enrollment fees
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Total Fees</div>

          <div className="text-lg font-semibold">
            {formatCurrency(data.total_amount)}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Collected</div>

          <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(data.total_paid)}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Pending</div>

          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(data.total_pending)}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Overpaid</div>

          <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
            {formatCurrency(data.total_overpaid)}
          </div>
        </div>
      </div>
    </div>
  );
}
