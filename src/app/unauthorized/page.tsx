import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/components/ui/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-4 border border-gray-300 rounded-md p-6">
        <h1 className="text-xl font-semibold">Access denied</h1>

        <p className="text-sm text-muted-foreground">
          You do not have permission to view this page.
        </p>

        <div className="pt-2">
          <Button asChild className="w-full">
            <Link href="/">Go back</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
