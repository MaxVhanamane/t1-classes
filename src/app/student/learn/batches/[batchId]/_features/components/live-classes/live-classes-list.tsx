"use client";

import { LiveClassCard } from "./live-class-card";

import { BatchLiveClass } from "../../types/live-class.types";

type Props = {
  items: BatchLiveClass[];

  onOpen: (liveClass: BatchLiveClass) => void;
};

export function LiveClassesList({ items, onOpen }: Props) {
  return (
    <div className="space-y-3">
      {items.map((liveClass) => (
        <LiveClassCard
          key={liveClass.id}
          liveClass={liveClass}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
