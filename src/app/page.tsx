import { FAQSection } from "./_features/faq-section";
import { FinalCTA } from "./_features/final-cta";
import { Footer } from "./_features/footer";
import { HeroSection } from "./_features/hero-section";
import { TestimonialsSection } from "./_features/testimonials";
import { TestPlatformShowcase } from "./_features/test-platform-showcase";
// import { TrustStrip } from "./_features/trust-strip";
import { WhyT1Section } from "./_features/why-t1";
import { ExploreCategories } from "./student/dashboard/_features/components/explore-categories";
import { LandingNavbar } from "./student/dashboard/_features/common/LandingNavbar";
import { LiveClassesSection } from "./_features/live-class-section";
import { MentorshipSection } from "./_features/mentorship-section";
import { GroupSessionSection } from "./_features/group-section";

export default function HomePage() {
  return (
    <main>
      <LandingNavbar action={{ href: "/login", label: "Login" }} />
      {/* HERO */}
      <HeroSection />

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8 -mt-10">
        <div className="space-y-20 py-24">
          {/* <TrustStrip /> */}

          <ExploreCategories />

          <WhyT1Section />

          <TestPlatformShowcase />
          <LiveClassesSection />
          <MentorshipSection />
          <GroupSessionSection />

          <TestimonialsSection />

          {/* <TeachersSection /> */}

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
