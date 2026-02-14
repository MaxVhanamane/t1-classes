"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type Props = {
    active: boolean;
};

export function useSubmissionGuard({ active }: Props) {
    useEffect(() => {
        if (!active) return;

        // Prevent refresh / close
        const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = ""; // Chrome fallback
        };

        // Warn on tab switch
        const visibilityHandler = () => {
            if (document.hidden) {
                toast.warning("Submission in progress", {
                    description:
                        "Please don’t switch tabs or close the browser while submitting your test.",
                    duration: 4000,
                });
            }
        };

        window.addEventListener("beforeunload", beforeUnloadHandler);
        document.addEventListener("visibilitychange", visibilityHandler);

        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            document.removeEventListener(
                "visibilitychange",
                visibilityHandler
            );
        };
    }, [active]);
}
