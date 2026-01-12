export default function InactivePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md text-center bg-white p-8 rounded-xl border border-gray-300">
        <h1 className="text-2xl font-semibold text-gray-900">
          Account Inactive
        </h1>

        <p className="mt-4 text-gray-600">
          Your account has been temporarily disabled by an administrator. Please
          contact support if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}
