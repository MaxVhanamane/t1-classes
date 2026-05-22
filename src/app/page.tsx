import { FAQSection } from "./_features/faq-section";
import { FinalCTA } from "./_features/final-cta";
import { Footer } from "./_features/footer";
import { HeroSection } from "./_features/hero-section";
import { TeachersSection } from "./_features/teachers-section";
import { TestimonialsSection } from "./_features/testimonials";
import { TestPlatformShowcase } from "./_features/test-platform-showcase";
import { TrustStrip } from "./_features/trust-strip";
import { WhyT1Section } from "./_features/why-t1";
import { ExploreCategories } from "./student/dashboard/_features/components/explore-categories";
import { LandingNavbar } from "./student/dashboard/_features/common/LandingNavbar";

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <LandingNavbar />
      {/* HERO */}
      <HeroSection />

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-24 py-24 sm:space-y-32 sm:py-32">
          <TrustStrip />

          <ExploreCategories />

          <WhyT1Section />

          <TestPlatformShowcase />

          <TestimonialsSection />

          <TeachersSection />

          <FAQSection />
        </div>
      </div>

      {/* CTA */}
      <div className="pt-8 pb-24 sm:pt-12 sm:pb-32">
        <FinalCTA />
      </div>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
