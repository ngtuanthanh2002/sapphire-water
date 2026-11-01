import Header from "@/components/Header";
import HeroSection from "@/components/sections/HeroSection";
import EssenceSection from "@/components/sections/EssenceSection";
import WaterMotionSection from "@/components/sections/WaterMotionSection";
import ProductSection from "@/components/sections/ProductSection";
import PuritySection from "@/components/sections/PuritySection";
import QualitySection from "@/components/sections/QualitySection";
import ProcessSection from "@/components/sections/ProcessSection";
import WhySection from "@/components/sections/WhySection";
import MomentsSection from "@/components/sections/MomentsSection";
import BrandStatementSection from "@/components/sections/BrandStatementSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header home />
      <main>
        <HeroSection />
        <EssenceSection />
        <WaterMotionSection />
        <ProductSection />
        <PuritySection />
        <QualitySection />
        <ProcessSection />
        <WhySection />
        <MomentsSection />
        <BrandStatementSection />
      </main>
      <Footer />
    </>
  );
}
