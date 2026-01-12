import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Trash2, Plus } from "lucide-react";

export function BatchHighlightsEditor() {
  const { control, register } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "batch_highlights.sections",
  });

  return (
    <div className="space-y-4">
      <Label>Batch Highlights</Label>

      {fields.map((section, sectionIndex) => (
        <div key={section.id} className="border rounded-md p-3 space-y-3">
          {/* Section title */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Section title (e.g. What's Included)"
              {...register(`batch_highlights.sections.${sectionIndex}.title`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(sectionIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Items */}
          <ItemsEditor sectionIndex={sectionIndex} />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            title: "",
            items: [""],
          })
        }
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Section
      </Button>
    </div>
  );
}

function ItemsEditor({ sectionIndex }: { sectionIndex: number }) {
  const { control, register } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `batch_highlights.sections.${sectionIndex}.items`,
  });

  return (
    <div className="space-y-2 pl-2">
      {fields.map((item, itemIndex) => (
        <div key={item.id} className="flex items-center gap-2">
          <Input
            placeholder="Bullet point"
            {...register(
              `batch_highlights.sections.${sectionIndex}.items.${itemIndex}`
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(itemIndex)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => append("")}
      >
        <Plus className="mr-1 h-3 w-3" />
        Add Item
      </Button>
    </div>
  );
}
