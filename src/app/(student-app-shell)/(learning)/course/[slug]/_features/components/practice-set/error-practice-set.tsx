export function ErrorPracticeSet({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-sm text-red-600">
      {message}
    </div>
  );
}
