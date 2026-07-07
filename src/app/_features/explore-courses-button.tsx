"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function ExploreCoursesButton() {
  return (
    <Button
      onClick={() => {
        const element = document.getElementById("explore-section");
        if (element) {
          const offset = 64;
          const top =
            element.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }}
      size="lg"
      className="h-12 w-fit rounded-xl px-8 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 border-0 shadow-lg shadow-amber-500/25 transition-all sm:w-auto"
    >
      Explore Courses & Batches
      <ArrowRight className="ml-2 size-4" />
    </Button>
  );
}
