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

export async function PendingFeesStat() {
  const supabase = await supabaseClient();
  const { data } = await supabase
    .from("enrollment_fee_status")
    .select("pending_amount");

  const total = data?.reduce((sum, r) => sum + (r.pending_amount || 0), 0) ?? 0;

  return (
    <StatCard
      icon={Wallet}
      label="Pending Fees"
      value={`₹${total.toLocaleString("en-IN")}`}
      accent="destructive"
    />
  );
}
