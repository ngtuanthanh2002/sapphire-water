import Header from "@/components/Header";
import HeroSection from "@/components/sections/HeroSection";
import EssenceSection from "@/components/sections/EssenceSection";
import WaterMotionSection from "@/components/sections/WaterMotionSection";
import ProductSection from "@/components/sections/ProductSection";
import PuritySection from "@/components/sections/PuritySection";
import QualitySection from "@/components/sections/QualitySection";
import WhySection from "@/components/sections/WhySection";
import BrandStatementSection from "@/components/sections/BrandStatementSection";
import FinalSection from "@/components/sections/FinalSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <EssenceSection />
        <WaterMotionSection />
        <ProductSection />
        <PuritySection />
        <QualitySection />
        <WhySection />
        <BrandStatementSection />
        <FinalSection />
      </main>
      <Footer />
    </>
  );
}
