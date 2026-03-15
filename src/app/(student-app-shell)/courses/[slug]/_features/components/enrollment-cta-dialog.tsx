"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Phone,
  Mail,
  MessageCircle,
  GraduationCap,
  Users,
  CheckCircle2,
} from "lucide-react";
import { motion, Variants } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { formatPriceWithComma } from "@/src/lib/helper-functions/format-price-with-comma";
import { enrollmentLeadSchema } from "@/src/app/api/enrollment-leads/zod/enrollment-lead.schema";
import { toast } from "sonner";
import confetti from "canvas-confetti";
/* NEW — Turnstile */
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";

/* Animation */

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22 },
  },
};

export function EnrollmentCTADialog({
  open,
  onOpenChange,
  batchId,
  courseId,
  title,
  price,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  batchId?: string | null;
  courseId?: string | null;
  title: string;
  price?: number;
}) {
  const isBatch = Boolean(batchId);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  /* NEW — captcha + honeypot */

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [website, setWebsite] = useState(""); // honeypot

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* Reset everything when dialog closes */

  useEffect(() => {
    if (!open) {
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setCaptchaToken(null);
      setWebsite("");
      setErrors({});
      setSuccess(false);
      setLoading(false);
    }
  }, [open]);

  const whatsappMessage = encodeURIComponent(
    `Hi, I am interested in enrolling in *${title}*.`,
  );

  const whatsappLink = `https://wa.me/918390008589?text=${whatsappMessage}`;

  const gmailLink = `https://mail.google.com/mail/?view=cm&to=maxvhanamane@gmail.com&su=Enrollment Inquiry&body=Hi, I am interested in enrolling in ${title}`;

  const heading = isBatch ? `Enroll in ${title}` : `Join ${title}`;

  const subtext = isBatch
    ? "Secure your seat in this batch. Our team will contact you."
    : "Get access to this course. Our team will guide you.";

  const features = isBatch
    ? [
        "Live Classes",
        "Weekly Tests",
        "Doubt Solving",
        "Structured Content",
        "Practice Material",
        "Instructor Support",
      ]
    : [
        "Structured Content",
        "Concept Clarity",
        "Practice Material",
        "Instructor Support",
      ];

  async function handleSubmit() {
    if (loading || success) return;

    setErrors({});

    if (website) {
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete captcha verification.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setErrors({
        phone: "Phone number must be exactly 10 digits",
      });
      return;
    }

    const payload = {
      course_id: courseId ?? null,
      batch_id: batchId ?? null,
      name,
      phone,
      email: email || null,
      message: message || null,
      captchaToken,
      website,
    };

    const parsed = enrollmentLeadSchema.safeParse(payload);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/enrollment-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(data?.error || "Submission failed");
      }

      setSuccess(true);

      toast.success("Request submitted", {
        description: "Our team will contact you shortly.",
      });
    } catch (err: unknown) {
      // Reset captcha after backend failure
      setCaptchaToken(null);
      turnstileRef.current?.reset();

      let message = "Please verify again and try once more.";

      if (err instanceof Error) {
        message = err.message;
      }

      toast.error("Submission failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0  rounded-2xl border bg-background/95 backdrop-blur shadow-2xl w-[calc(100%-10px)] sm:w-full h-(--h-viewport-minus-navbar) overflow-y-auto">
        {success ? (
          <SuccessScreen
            title={title}
            onClose={() => onOpenChange(false)}
            whatsappLink={whatsappLink}
          />
        ) : (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Enrollment request form</DialogTitle>
            </DialogHeader>

            <div className="p-6 border-b bg-muted/40 space-y-3">
              <div className="flex items-start gap-3">
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  {isBatch ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    <GraduationCap className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <DialogTitle className="text-base sm:text-lg font-semibold">
                    {heading}
                  </DialogTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {subtext}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {price && (
                  <Badge variant="secondary">
                    ₹ {formatPriceWithComma(price)}
                  </Badge>
                )}
                <Badge className="bg-emerald-500/10 text-emerald-600">
                  Admissions Open
                </Badge>
              </div>
            </div>

            <motion.div className="p-6 space-y-6">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-3"
              >
                {features.map((f) => (
                  <Feature key={f} text={f} />
                ))}
              </motion.div>

              <div className="space-y-5">
                <Field
                  value={name}
                  onChange={setName}
                  placeholder="Full Name"
                  error={errors.name}
                />
                <Field
                  value={phone}
                  onChange={setPhone}
                  placeholder="Phone Number"
                  error={errors.phone}
                />
                <Field
                  value={email}
                  onChange={setEmail}
                  placeholder="Email (Optional)"
                  error={errors.email}
                />
                <Field
                  value={message}
                  onChange={setMessage}
                  placeholder="Message (Optional)"
                  error={errors.message}
                />

                {/* Honeypot hidden field */}

                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="hidden"
                  autoComplete="off"
                  tabIndex={-1}
                />
              </div>

              {/* Turnstile */}

              <div className="flex justify-left">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  options={{
                    theme: "auto",
                    size: "normal", // normal | compact
                    appearance: "always", // always | interaction-only
                  }}
                  onSuccess={(token) => {
                    setCaptchaToken(token);
                  }}
                  onExpire={() => {
                    setCaptchaToken(null);
                  }}
                  onError={() => {
                    setCaptchaToken(null);
                    turnstileRef.current?.reset();
                  }}
                  onTimeout={() => {
                    setCaptchaToken(null);
                    turnstileRef.current?.reset();
                  }}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || !captchaToken}
                className="w-full h-11"
              >
                {loading ? "Submitting..." : "Request Enrollment"}
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px bg-border flex-1" />
                <span className="text-xs text-muted-foreground">
                  OR CONTACT DIRECTLY
                </span>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <ContactButton
                  icon={Phone}
                  label="Call"
                  href="tel:+918390008589"
                />
                <ContactButton
                  icon={MessageCircle}
                  label="WhatsApp"
                  href={whatsappLink}
                />
                <ContactButton icon={Mail} label="Email" href={gmailLink} />
              </div>
            </motion.div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
/* Success Screen */

function SuccessScreen({
  title,
  onClose,
  whatsappLink,
}: {
  title: string;
  onClose: () => void;
  whatsappLink: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasFired = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (hasFired.current) return;

    hasFired.current = true;

    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });

    void myConfetti({
      particleCount: 40,
      spread: 70,
      startVelocity: 30,
      gravity: 0.9,
      scalar: 0.8,
      ticks: 120,
      origin: { x: 0.5, y: 0.35 },
      colors: ["#10b981", "#34d399", "#6ee7b7"],
    });
  }, []);

  return (
    <div className="relative p-2 sm:p-6 flex flex-col items-center justify-center text-center space-y-6 overflow-hidden">
      {/* Local confetti canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <DialogHeader className="sr-only">
        <DialogTitle>Enrollment request success</DialogTitle>
      </DialogHeader>

      <div className="relative border flex flex-col items-center justify-center p-6 lg:p-8 rounded-xl space-y-6 bg-background">
        {/* ================= Icon + Sparkle System ================= */}
        <div className="relative flex items-center justify-center">
          {/* Expanding ring */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
            className="absolute h-16 w-16 rounded-full border border-emerald-400/40"
          />

          {/* Glow pulse */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
            className="absolute h-16 w-16 rounded-full bg-emerald-500/20 blur-xl"
          />

          {/* Sparkle particles */}
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                x: Math.cos((i * 60 * Math.PI) / 180) * 38,
                y: Math.sin((i * 60 * Math.PI) / 180) * 38,
              }}
              transition={{
                duration: 0.9,
                ease: "easeOut",
                delay: 0.15,
              }}
              className="absolute h-2 w-2 rounded-full bg-emerald-400"
            />
          ))}

          {/* Icon badge */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-9 w-9 text-emerald-500" />
          </div>
        </div>

        {/* ================= Text ================= */}
        <div className="space-y-2 max-w-sm">
          <h3 className="text-lg font-semibold">Request Received</h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you for your interest in{" "}
            <span className="font-medium text-foreground">{title}</span>. Our
            team will contact you shortly.
          </p>
        </div>

        {/* ================= Actions ================= */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={onClose}>Close</Button>

          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">WhatsApp Us</Button>
          </a>
        </div>
      </div>
    </div>
  );
}

/* Field */

function Field({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="relative ">
      <Input
        maxLength={300}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "border-destructive" : ""}
      />

      {error && (
        <p className="absolute -bottom-4 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

/* Feature */

function Feature({ text }: { text: string }) {
  return (
    <motion.div variants={item} className="flex items-start gap-2.5">
      <CheckCircle2 className="h-4 w-4 mt-0.5 text-white opacity-80" />
      <p className="text-sm text-foreground/90">{text}</p>
    </motion.div>
  );
}

/* Contact Button */

function ContactButton({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  href: string;
}) {
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      <Button type="button" variant="outline" className="w-full flex gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    </a>
  );
}
