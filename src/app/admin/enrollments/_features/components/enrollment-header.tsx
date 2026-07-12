import { Button } from "@/src/components/ui/button";
import { RefreshButton } from "@/src/components/ui/common/refresh-button";
import { Plus } from "lucide-react";
type Props = {
  onCreate: () => void;
  isFetching: boolean;
};

export function EnrollmentHeader({ isFetching, onCreate }: Props) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-semibold">Enrollments</h1>

        <p className="text-muted-foreground text-sm hidden md:block">
          Manage your enrollments and their details.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onCreate}
          className="cursor-pointer flex items-center justify-center gap-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          <p>Create Enrollment</p>
        </Button>
        <RefreshButton
          isFetching={isFetching}
          size="default"
          queryKey={["admin", "enrollments"]}
        />
      </div>
    </div>
  );
}
