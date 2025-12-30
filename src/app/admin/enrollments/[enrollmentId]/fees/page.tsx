import { getEnrollmentPricingContext } from "./_features/actions/get-enrollment-pricing-context";
import { getPaymentsForEnrollment } from "./_features/actions/payments/get-payments-for-enrollment";
import { FeeSection } from "./_features/components/fee-section";

interface PageProps {
  params: Promise<{ enrollmentId: string }>;
}
export default async function EnrollmentFeesPage({ params }: PageProps) {
  const { enrollmentId } = await params;
  const pricing = await getEnrollmentPricingContext(enrollmentId);

  const payments = await getPaymentsForEnrollment(enrollmentId);
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Fees</h1>
      <FeeSection
        enrollmentId={enrollmentId}
        pricing={pricing}
        payments={payments}
      />
    </div>
  );
}
