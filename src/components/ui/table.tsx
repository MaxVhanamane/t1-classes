"use client";

import * as React from "react";

import { cn } from "@/src/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Tracks the raw pointer-down state before we know whether this is a
  // click (e.g. on a sort button/checkbox/link inside a cell) or a drag.
  // We only start actually scrolling — and only acquire pointer capture —
  // once the pointer has moved past a small threshold. This means a plain
  // click on interactive content inside the table still works normally;
  // only a genuine drag gesture hijacks the pointer.
  const dragState = React.useRef({
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
    dragging: false,
  });

  const DRAG_THRESHOLD = 4; // px

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;

    const container = containerRef.current;
    if (!container) return;
    if (container.scrollWidth <= container.clientWidth) return; // nothing to scroll

    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      scrollLeft: container.scrollLeft,
      dragging: false,
    };
    // Deliberately NOT calling setPointerCapture here — see comment above.
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    if (dragState.current.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - dragState.current.startX;

    if (!dragState.current.dragging) {
      if (Math.abs(deltaX) < DRAG_THRESHOLD) return;
      // Threshold crossed — this is now a drag, not a click. Grab the
      // pointer so movement is tracked even if the cursor leaves the
      // table's bounds, and switch on the grabbing cursor/no-select state.
      dragState.current.dragging = true;
      container.setPointerCapture(e.pointerId);
      setIsDragging(true);
    }

    container.scrollLeft = dragState.current.scrollLeft - deltaX;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (dragState.current.pointerId !== e.pointerId) return;

    if (container?.hasPointerCapture(e.pointerId)) {
      container.releasePointerCapture(e.pointerId);
    }
    dragState.current = {
      pointerId: -1,
      startX: 0,
      scrollLeft: 0,
      dragging: false,
    };
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      data-slot="table-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "relative w-full overflow-x-auto",
        isDragging ? "cursor-grabbing select-none" : "cursor-grab",
      )}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
