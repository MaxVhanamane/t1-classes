"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/src/components/ui/dropdown-menu";

import Image from "next/image";
import { User } from "lucide-react";
import { Button } from "../button";
import { useMounted } from "@/src/hooks/use-mounted";
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
  const mounted = useMounted();

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    const fetchUser = async () => {
      const data = await getUserForMenu();
      setUser(data);
      setLoading(false);
    };

    void fetchUser();
  }, [mounted]);

  /**
   *  EARLY RETURN
   * Server + First Client Paint → Static button
   * No Radix → No dynamic IDs → No mismatch
   */
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        aria-label="User menu"
        className="ml-3 p-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center"
      >
        <div className="h-8 w-8 flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      </Button>
    );
  }

  /**
   *  Hydrated Client Render
   * Now safe to render Radix + async data
   */
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="User menu"
          className="ml-3 p-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center"
        >
          <div className="relative h-8 w-8 rounded-full overflow-hidden">
            {user?.profile_image ? (
              <Image
                src={user.profile_image}
                alt={user.full_name}
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0 shadow-none">
        {loading ? (
          <UserMenuSkeleton />
        ) : (
          <UserMenuContent user={user} onUserUpdate={setUser} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
