import { AppUser } from "@/src/types/user";
import UserTableRow from "@/src/app/admin/users/_features/components/user-table-row";
import UserCard from "@/src/app/admin/users/_features/components/user-card";
import CreateUserDialog from "@/src/app/admin/users/_features/components/create-user-dialog";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
// import { createUserWithPassword } from "./_features/actions/create-user-with-password";
export default async function UsersPage() {
  // await createUserWithPassword({
  //   email: "user1@gmail.com",
  //   password: "user1@7",
  //   full_name: "User One",
  //   role: "student",
  // });
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("users")
    .select("id, full_name, phone,email, role, status, created_at")
    .order("created_at", { ascending: false });

  const users = data as AppUser[];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex gap-2 justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <CreateUserDialog />
      </div>

      {/*  Desktop */}
      <div className="hidden md:block rounded-lg border ">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th>Phone</th>
              <th>Email</th>
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
