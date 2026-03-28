"use client";

import { AvatarUploader } from "./avtar-uploader";
import { LogoutButton } from "../logout-buttont";

type User = {
  id: string;
  full_name: string;
  email: string;
  profile_image: string | null;
};

type Props = {
  user: User | null;
  onUserUpdate: (user: User) => void;
};

export function UserMenuContent({ user, onUserUpdate }: Props) {
  if (!user) {
    return (
      <div className="p-4 text-sm text-muted-foreground">Loading user…</div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <AvatarUploader
          user={user}
          onAvatarUpdated={(newKey) =>
            onUserUpdate({
              ...user,
              profile_image: newKey ? `${newKey}?v=${Date.now()}` : null,
            })
          }
        />

        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user.full_name} </p>
          <p className="text-xs text-muted-foreground truncate">
            {user.email}{" "}
          </p>
        </div>
      </div>

      <div className="border-t pt-2">
        <LogoutButton />
      </div>
    </div>
  );
}
