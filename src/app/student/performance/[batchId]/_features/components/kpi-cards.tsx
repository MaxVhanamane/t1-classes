import { CheckCircle2, Target, Trophy, Info, Percent } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { RichPopover } from "@/src/components/ui/common/rich-popover";
import { CardGlow } from "@/src/components/ui/common/card-glow";
import DottedBackground from "@/src/components/dotted-background";
import { CountUpNumber } from "@/src/app/student/tests/results/[attemptId]/_features/components/count-up-number";

interface KpiCardsProps {
  averagePercentage: number;
  averagePercentile: number;
  overallAccuracy: number;
  attendancePercentage: number;
  presentCount: number;
  totalSessions: number;
}

export function KpiCards({
  averagePercentage,
  averagePercentile,
  overallAccuracy,
  attendancePercentage,
  presentCount,
  totalSessions,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <Card className="relative overflow-hidden py-2 gap-3">
        <DottedBackground />
        <CardGlow color="cyan" />
        <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 pb-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <CardTitle className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
              Avg. Score
            </CardTitle>
            <RichPopover
              color="cyan"
              badgeText="Score"
              title="Average Percentage"
              description="This is the raw average of marks you scored across all tests in this batch. It reflects your direct mastery of the material."
              trigger={
                <Info className="h-3 w-3 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
              }
            />
          </div>
          <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10">
            <Percent className="h-3.5 w-3.5 shrink-0 text-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-lg font-bold sm:text-xl">
            <CountUpNumber start value={Number(averagePercentage.toFixed(2))} />{" "}
            %
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden py-2 gap-3">
        <DottedBackground />
        <CardGlow color="yellow" />
        <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 pb-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <CardTitle className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
              Avg. Percentile
            </CardTitle>
            <RichPopover
              color="yellow"
              badgeText="Ranking"
              title="Understanding Percentile"
              description="Percentile ranks you against your classmates. A percentile of 85 means you scored equal to or better than 85% of the students, regardless of how difficult the test was."
              trigger={
                <Info className="h-3 w-3 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
              }
            />
          </div>
          <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10">
            <Trophy className="h-3.5 w-3.5 shrink-0 text-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-lg font-bold sm:text-xl">
            <CountUpNumber start value={Number(averagePercentile.toFixed(2))} />{" "}
            %
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden py-2 gap-3">
        <DottedBackground />
        <CardGlow color="pink" />
        <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 pb-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <CardTitle className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
              Overall Accuracy
            </CardTitle>
            <RichPopover
              color="pink"
              badgeText="Precision"
              title="Accuracy Rate"
              description="The percentage of questions you answered correctly out of all the questions you attempted. Skipping a question does not hurt your accuracy rate."
              trigger={
                <Info className="h-3 w-3 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
              }
            />
          </div>
          <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10">
            <Target className="h-3.5 w-3.5 shrink-0 text-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-lg font-bold sm:text-xl">
            <CountUpNumber start value={Number(overallAccuracy.toFixed(2))} /> %
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden py-2 gap-3">
        <DottedBackground />
        <CardGlow color="indigo" />
        <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 pb-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <CardTitle className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
              Attendance
            </CardTitle>
            <RichPopover
              color="purple"
              badgeText="Consistency"
              title="Class Attendance"
              description="The percentage of batch sessions you have attended. Consistent attendance correlates heavily with better test scores."
              trigger={
                <Info className="h-3 w-3 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
              }
            />
          </div>
          <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-background/70 dark:bg-white/10 backdrop-blur-md border border-white/10">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-lg font-bold sm:text-xl">
            <CountUpNumber
              start
              value={Number(attendancePercentage.toFixed(0))}
            />{" "}
            %
          </div>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
            {presentCount} / {totalSessions} sessions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
