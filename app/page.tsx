import { Calendar } from "./components/calendar/Calendar";
import { AdBanner } from "./components/adBanner/AdBanner";
import { LogoSm } from "./components/logo/LogoSm";
import { MeaChat } from "./components/meaChat/MeaChat";

export default function Home() {
  return (
    <main>
      <div className="w-12 pt-3 mx-auto flex md:hidden">
        <LogoSm />
      </div>
      <div className="flex flex-row-reverse w-full relative">
        <AdBanner />
        <div className="w-full">
          <Calendar />
        </div>
        <MeaChat />
      </div>
    </main>
  );
}
