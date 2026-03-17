import { Ads } from "./Ads";

interface AdBannerProps {
  variant?: "sidebar" | "inline";
}

export const AdBanner = ({ variant = "sidebar" }: AdBannerProps) => {
  if (variant === "sidebar") {
    return (
      <div className="hidden md:grid grid-cols-1 grid-rows-3 gap-2 w-[15vw] p-2">
        <Ads />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 grid-rows-1 gap-2 my-2 md:hidden">
      <Ads />
    </div>
  );
};
