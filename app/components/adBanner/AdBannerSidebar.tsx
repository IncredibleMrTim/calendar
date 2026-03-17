"use client";
import { AdBanner } from "./AdBanner";

interface AdBannerSidebarProps {
  variant?: "sidebar" | "inline";
}

export const AdBannerSidebar = ({ variant = "sidebar" }: AdBannerSidebarProps) => {
  if (variant === "sidebar") {
    return (
      <div className="hidden md:grid grid-cols-1 grid-rows-3 gap-2 w-[15vw] p-2">
        <AdBanner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 grid-rows-1 gap-2 my-2 md:hidden">
      <AdBanner />
    </div>
  );
};
