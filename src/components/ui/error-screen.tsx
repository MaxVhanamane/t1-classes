export function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900">{message}</p>
        <p className="mt-2 text-sm text-gray-600">
          Please contact your teacher if this seems incorrect.
        </p>
      </div>
    </div>
  );
}
