import { Link } from "@/src/components/ui/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { RiInstagramLine } from "react-icons/ri";
import { FiYoutube } from "react-icons/fi";

const FOOTER_LINKS = {
  Platform: [
    {
      label: "Courses",
      href: "/courses",
    },
    {
      label: "Batches",
      href: "/batches",
    },
    {
      label: "Test Series",
      href: "/tests",
    },
    {
      label: "Live Classes",
      href: "/live",
    },
  ],

  Company: [
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
    {
      label: "Careers",
      href: "/careers",
    },
  ],

  Legal: [
    {
      label: "Privacy Policy",
      href: "/privacy-policy",
    },
    {
      label: "Terms & Conditions",
      href: "/terms",
    },
    {
      label: "Refund Policy",
      href: "/refund-policy",
    },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-14 py-14 lg:grid-cols-[1.2fr_1fr]">
          {/* LEFT */}
          <div>
            {/* brand */}
            <div>
              <h2 className="text-2xl font-black tracking-tight">T1 Classes</h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                Structured learning platform for competitive exams with courses,
                live classes, advanced testing, analytics, and mentorship.
              </p>
            </div>

            {/* contact */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="size-4" />
                <span>support@t1classes.com</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="size-4" />
                <span>+91 98765 43210</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                <span>Pune, Maharashtra</span>
              </div>
            </div>

            {/* social */}
            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/"
                className="flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-background transition-colors hover:bg-muted"
              >
                <RiInstagramLine className="size-5" />
              </Link>

              <Link
                href="/"
                className="flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-background transition-colors hover:bg-muted"
              >
                <FiYoutube className="size-5" />
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section}>
                <h3 className="text-sm font-bold tracking-wide uppercase">
                  {section}
                </h3>

                <div className="mt-5 space-y-4">
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* bottom */}
        <div className="flex flex-col gap-4 border-t border-border/60 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 T1 Classes. All rights reserved.</p>

          <p>Built for focused and serious learning.</p>
        </div>
      </div>
    </footer>
  );
}
