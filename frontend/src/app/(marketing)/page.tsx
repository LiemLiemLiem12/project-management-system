import CTASection from "@/components/Landing/CTASection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import HeroSection from "@/components/Landing/HeroSection";

export default function LandingHome() {
  return (
    <div className="min-h-screen ">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
