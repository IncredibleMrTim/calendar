import Image from "next/image";
import { Calendar } from "./components/calendar/Calendar";

export default function Home() {
  return (
    <main>
      <div className="flex">
        <div className="flex flex-col w-[85vw]">
          <Calendar />
        </div>
        <div className="grid grid-cols-1 grid-rows-3 gap-2 w-[15vw] p-2">
          <div className="flex justify-center items-center p-1 border border-gray-200 shadow rounded">
            <Image
              src="/add-1.webp"
              alt="Advertise Here"
              width={255}
              height="420"
            />
          </div>
          <div className="flex justify-center items-center p-1 border border-gray-200 shadow rounded">
            <Image
              src="/add-2.webp"
              alt="Advertise Here"
              width={255}
              height="420"
            />
          </div>
          <div className="flex justify-center items-center p-1 border border-gray-200 shadow rounded">
            <Image
              src="/advertise-here.webp"
              alt="Advertise Here"
              width={255}
              height="420"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
