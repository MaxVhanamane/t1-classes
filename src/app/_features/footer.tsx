import { Link } from "@/src/components/ui/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { RiInstagramLine } from "react-icons/ri";
import { FiYoutube } from "react-icons/fi";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        {/* Brand */}
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          T1 Classes
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground text-balance">
          A proven learning system built for serious aspirants. Master concepts,
          practice better, and secure your rank.
        </p>

        {/* Contact (Centered and highlighted) */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="size-4 " />
            <span className="font-semibold text-foreground">
              +91 8390008589
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4 text-primary" />
            <span>support@t1classes.com</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" />
            <span>Solapur, Maharashtra</span>
          </div>
        </div>

        {/* Socials */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RiInstagramLine className="size-5" />
          </Link>

          <Link
            href="/"
            className="flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <FiYoutube className="size-5" />
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 T1 Classes. All rights reserved.</p>
      </div>
    </footer>
  );
}
