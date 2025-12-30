// app/student/papers/view/page.tsx

import ViewerClient from "@/src/components/ui/viewer-client";
import { Suspense } from "react";

export default function PaperViewerPage() {
  return (
    <Suspense>
      <Viewer />
    </Suspense>
  );
}

function Viewer() {
  // In App Router, search params come from URL
  // We’ll read them using useSearchParams (client)
  return <ViewerClient />;
}
