import { Card } from "@/src/components/ui/card";
import { AddSectionButton } from "./add-section-button";

interface Props {
  testType: "standard" | "sectioned";
  testId: string;
}

export function SectionsEmptyState({ testType, testId }: Props) {
  return (
    <Card className="p-6 text-center space-y-3">
      <h2 className="text-base font-medium">No sections added yet</h2>

      <p className="text-sm text-muted-foreground">
        {testType === "standard"
          ? "Add one section to define how questions will be evaluated."
          : "Add sections to define different marking schemes for this test."}
      </p>
      <div className="w-full flex justify-center ">
        <AddSectionButton testId={testId} testType={testType} />
      </div>
    </Card>
  );
}
