"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/src/components/ui/dropdown-menu";
import Image from "next/image";
import { User } from "lucide-react";

import { UserMenuSkeleton } from "./user-menu-skeleton";
import { UserMenuContent } from "./user-menu-content";
import { getUserForMenu } from "@/src/lib/helper-functions/getCurrentUserOptimal";

type UserType = {
  id: string;
  full_name: string;
  email: string;
  profile_image: string | null;
};

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const data = await getUserForMenu();
      setUser(data);
      setLoading(false);
    };

    void fetchUser();
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="User menu"
          className="
            ml-3 relative h-9 w-9 rounded-full
            overflow-visible bg-muted cursor-pointer
            flex items-center justify-center
            
          "
        >
          {/* Avatar */}
          <span className="relative h-full w-full rounded-full overflow-hidden">
            {user?.profile_image ? (
              <Image
                src={user.profile_image}
                alt={user.full_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {" "}
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0">
        {open && loading ? (
          <UserMenuSkeleton />
        ) : (
          <UserMenuContent user={user} onUserUpdate={setUser} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
