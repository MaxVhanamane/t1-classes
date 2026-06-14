"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createTestSchema, CreateTestSchema } from "../zod/create-test.schema";
import { createTest } from "../actions/create-test";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";
import { callServerAction } from "@/src/lib/actions/call-server-action";

export function CreateTestForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateTestSchema>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      title: "",
      description: "",
      testType: "standard",
    },
  });

  const onSubmit = (values: CreateTestSchema) => {
    startTransition(async () => {
      const toastId = toast.loading("Creating test…");

      const { data: testId, error } = await callServerAction(
        createTest(values),
      );

      if (error || !testId) {
        toast.error(error ?? "Something went wrong. Please try again.", {
          id: toastId,
        });
        return;
      }

      toast.success("Test created successfully", {
        id: toastId,
      });

      router.push(`/admin/tests/${testId}`);
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* BASIC INFO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test details</CardTitle>
          <CardDescription>
            Give your test a clear name for students and reports
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Test title</Label>
            <Input {...form.register("title")} disabled={isPending} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              rows={3}
              {...form.register("description")}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* TEST TYPE */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test type</CardTitle>
          <CardDescription>
            Choose how this test will be structured
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RadioGroup
            defaultValue={form.getValues("testType")}
            onValueChange={(value) =>
              form.setValue("testType", value as "standard" | "sectioned", {
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            className="space-y-3"
          >
            <Label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
              <RadioGroupItem value="standard" disabled={isPending} />
              <div>
                <p className="font-medium">Standard test</p>
                <p className="text-sm text-muted-foreground">
                  One section with uniform marking
                </p>
              </div>
            </Label>

            <Label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
              <RadioGroupItem value="sectioned" disabled={isPending} />
              <div>
                <p className="font-medium">Sectioned test</p>
                <p className="text-sm text-muted-foreground">
                  Multiple sections with different marking schemes
                </p>
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* ACTION */}
      <div className="flex items-center justify-end">
        <Button type="submit" className="w-full md:w-fit" disabled={isPending}>
          {isPending ? "Creating…" : "Create test"}
        </Button>
      </div>
    </form>
  );
}
