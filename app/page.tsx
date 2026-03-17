import { Calendar } from "./components/calendar/Calendar";
import { AdBanner } from "./components/adBanner/AdBanner";

export default function Home() {
  return (
    <main>
      <div className="flex flex-row-reverse w-full p-2 md:p-0">
        <AdBanner />
        <div className="w-full">
          <Calendar />
        </div>
      </div>
    </main>
  );
}
