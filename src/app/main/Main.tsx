"use client";

import React from "react";
import HeroSection from "@/components/heroSection/HeroSection";
import FeatureSection from "@/components/featureSection/FeatureSection";
import HowItWorks from "@/components/howItWorks/HowItWorks";

const Main = () => {
  return (
    <div>
      <HeroSection />
      <FeatureSection />
      <HowItWorks />
    </div>
  );
};

export default Main;
