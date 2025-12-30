import Link from "next/link";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {/* Centered Container */}
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome, Rahul 👋
          </h1>
          <p className="text-sm text-gray-600">
            Class 10 • Maths + Science Batch
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard title="Last Test" value="78 / 100" />
          <StatCard title="Class Rank" value="5" />
          <StatCard title="Attendance" value="92%" />
          <StatCard title="Tests Given" value="12" />
        </div>

        {/* Main Features */}
        <div className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Your Study Area
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <FeatureCard
              title="Test Results"
              description="Marks, rank & feedback"
            />
            <Link href="/student/papers">
              <FeatureCard
                title="Previous Year Papers"
                description="Board & exam papers"
              />
            </Link>
            <FeatureCard
              title="Notes & Material"
              description="Chapter-wise notes"
            />
            <FeatureCard
              title="Homework"
              description="Pending & submitted work"
            />
          </div>
        </div>

        {/* Announcements */}
        <div className="max-w-3xl">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Announcements
          </h2>

          <div className="space-y-3">
            <AnnouncementCard
              title="Maths test on Friday"
              description="Chapters: Trigonometry & Polynomials"
            />
            <AnnouncementCard
              title="Holiday on Monday"
              description="Coaching will remain closed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="cursor-pointer rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function AnnouncementCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
