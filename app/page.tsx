import { Calendar } from "./components/calendar/Calendar";
import { AdBanner } from "./components/adBanner/AdBanner";
import { MeaChat } from "./components/meaChat/MeaChat";
import Image from "next/image";
import { AuthUserMenu } from "./components/auth/authUserMenu/AuthUserMenu";

export default function Home() {
  return (
    <main className="relative">
      <div className="border-b shadow relative">
        <div className="absolute bottom-1 right-2">
          <AuthUserMenu />
        </div>
        <div className="justify-center w-3/4 p-4 pb-6 mx-auto flex md:hidden">
          <Image
            src="/pageant_calendar_no_strap.webp"
            width={300}
            height={91}
            className="w-full h-auto"
            alt="Pageant Calendar"
          />
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
