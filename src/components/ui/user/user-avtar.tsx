import { User } from "lucide-react";
import Image from "next/image";

export function UserAvatar({ src }: { src?: string | null }) {
  if (!src) {
    return (
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
        <User className="h-4 w-4" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt="Profile"
      width={36}
      height={36}
      className="rounded-full object-cover"
    />
  );
}
