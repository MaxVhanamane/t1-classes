"use client";

import { Clock, Info } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { motion } from "motion/react";

type Props = {
  message?: string;
};

export function PendingResultState({ message }: Props) {
  return (
    <div className="flex items-center justify-center p-6 sm:p-10 h-(--h-viewport-minus-navbar)">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="flex flex-col items-center text-center gap-6 p-10">
            {/* Icon */}
            <div className="p-5 rounded-2xl bg-blue-500/10">
              <Clock className="h-10 w-10 text-blue-600" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Result is being prepared
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {message ??
                  "Your test has ended, but your result is still being processed. Please check back shortly."}
              </p>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 text-left text-xs text-muted-foreground bg-muted/40 rounded-xl p-4">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                This can happen if the test closed before submission finished,
                your internet connection was interrupted, or the browser was
                closed while answers were being submitted. Don’t worry your
                responses are safely saved. Your result will be available once
                the test time is completely over for all students.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
