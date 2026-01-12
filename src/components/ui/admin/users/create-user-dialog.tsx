"use client";

import { useState } from "react";
import { UserRole } from "@/src/types/user";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/src/components/ui/dialog";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { createUserAdmin } from "@/src/app/admin/users/_features/actions/actions";
import { toast } from "sonner";

const roles: UserRole[] = ["student", "teacher", "admin"];

export default function CreateUserDialog() {
  const [open, setOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setEmail("");
    setName("");
    setPhone("");
    setRole("student");
    setLoading(false);
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      resetForm(); // dialog is closing
    }
    setOpen(isOpen);
  }

  async function handleCreate() {
    setLoading(true);
    try {
      await createUserAdmin({
        email,
        full_name: name,
        phone,
        role,
      });
      toast.success("User created");
      setOpen(false); // close dialog after success
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">Create User</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            className="cursor-pointer"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create & Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
