import Image from "next/image";
export const Ads = () => {
  return (
    <>
      <div className="flex justify-center items-center p-1 border border-gray-200 shadow rounded">
        <Image
          src="/add-1.webp"
          alt="Advertise Here"
          width={255}
          height={420}
        />
      </div>
      <div className="flex justify-center items-center p-1 border border-gray-200 shadow rounded">
        <Image
          src="/add-2.webp"
          alt="Advertise Here"
          width={255}
          height={420}
        />
      </div>
      <div className="flex justify-center items-center p-1 border border-gray-200 shadow rounded">
        <Image
          src="/advertise-here.webp"
          alt="Advertise Here"
          width={255}
          height={420}
        />
      </div>
    </>
  );
};
