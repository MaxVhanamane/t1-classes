import { AppUser } from "@/src/types/user";
import UserTableRow from "@/src/components/ui/admin/users/user-table-row";
import UserCard from "@/src/components/ui/admin/users/user-card";
import CreateUserDialog from "@/src/components/ui/admin/users/create-user-dialog";
import { Button } from "@/src/components/ui/button";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
export default async function UsersPage() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("users")
    .select("id, full_name, phone, role, status, created_at")
    .order("created_at", { ascending: false });

  const users = data as AppUser[];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <CreateUserDialog>
          <Button>Create User</Button>
        </CreateUserDialog>
      </div>

      {/*  Desktop */}
      <div className="hidden md:block rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserTableRow key={u.id} user={u} />
            ))}
          </tbody>
        </table>
      </div>

      {/*  Mobile */}
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <UserCard key={u.id} user={u} />
        ))}
      </div>
    </div>
  );
}
