"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Wifi, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { SyncStatus } from "../hooks/use-sync-status";

type Props = {
  status: SyncStatus;
};

export default function SyncDot({ status }: Props) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status.isSaved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSaved(true);

      const timer = setTimeout(() => {
        setShowSaved(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [status.isSaved]);

  if (
    status.isIdle ||
    (!status.isSaving && !status.isRetrying && !status.isError && !showSaved)
  ) {
    return null;
  }

  let label = "Saved";
  let Icon = CheckCircle;
  let color = "text-green-500";
  let key = "saved";

  if (status.isRetrying) {
    label = "Reconnecting…";
    Icon = Wifi;
    color = "text-yellow-500 animate-pulse";
    key = "retrying";
  } else if (status.isSaving) {
    label = "Saving…";
    Icon = RefreshCw;
    color =
      "text-zinc-500 dark:text-zinc-400 animate-[spin_1.5s_linear_infinite]";
    key = "saving";
  } else if (status.isError) {
    label = "Error";
    Icon = AlertCircle;
    color = "text-red-500";
    key = "error";
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Icon className={clsx("h-3.5 w-3.5 lg:h-4 lg:w-4", color)} />
        <span>{label}</span>
      </motion.div>
    </AnimatePresence>
  );
}
