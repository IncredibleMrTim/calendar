"use client";
import { Calendar } from "./components/calendar/Calendar";
import { AdBanner } from "./components/adBanner/AdBanner";
import { MeaChat } from "./components/meaChat/MeaChat";
import { Logos, LogoType } from "./components/logo/Logos";

export default function Home() {
  return (
    <main className="relative">
      <div className="border-b shadow relative">
        <div className="justify-center w-3/4 p-4 pb-6 mx-auto flex md:hidden">
          <Logos type={LogoType.PAGEANT_NO_STRAP} />
        </div>
      </div>
      <div className="flex flex-row-reverse w-full relative">
        <AdBanner />

        <div className="w-full">
          <Calendar />
        </div>
      </div>
      <div className="fixed bottom-0 right-0 z-20">
        <MeaChat />
      </div>
    </main>
  );
}
