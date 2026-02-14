type Props = {
  children: React.ReactNode;
};

export function CurriculumPreviewSection({ children }: Props) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Course Curriculum</h2>
        <p className="text-sm text-muted-foreground">
          Preview lessons and explore course structure.
        </p>
      </div>

      <div className=" overflow-hidden">{children}</div>
    </section>
  );
}
