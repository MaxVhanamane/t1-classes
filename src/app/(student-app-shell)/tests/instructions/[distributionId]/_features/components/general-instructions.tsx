import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Circle, CheckCircle2, Flag } from "lucide-react";
import { INSTRUCTION_COPY } from "../helpers/copy";

export default function GeneralInstructions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {INSTRUCTION_COPY.general.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <ul className="list-disc space-y-1 pl-5">
          {INSTRUCTION_COPY.general.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            {INSTRUCTION_COPY.legend.title}
          </p>

          <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-xs">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              {INSTRUCTION_COPY.legend.notVisited}
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-yellow-500" />
              {INSTRUCTION_COPY.legend.notAnswered}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              {INSTRUCTION_COPY.legend.answered}
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-purple-500" />
              {INSTRUCTION_COPY.legend.review}
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Flag className="h-4 w-4 text-green-600" />
              {INSTRUCTION_COPY.legend.answeredReview}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
