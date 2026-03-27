import Image from "next/image";
import { Logo as MeaLogo } from "./Logo";
import { LogoSm as MeaLogoSm } from "./LogoSm";
import { GoogleLogo } from "./GoogleLogo";

export enum LogoType {
  PAGEANT_FULL,
  PAGEANT_FULL_LG,
  PAGEANT_NO_STRAP,
  PAGEANT_SMALL,
  MEA,
  MEA_SM,
  GOOGLE,
}

type LogosProps = {
  type: LogoType;
} & Partial<React.ComponentProps<typeof Image>>;

export const Logos = ({ type, ...props }: LogosProps) => {
  switch (type) {
    case LogoType.PAGEANT_NO_STRAP:
      return (
        <Image
          src="/pageant_calendar_no_strap.webp"
          width={300}
          height={91}
          className="w-full h-auto"
          alt="Pageant Calendar"
          {...props}
        />
      );

    case LogoType.PAGEANT_FULL_LG:
      return (
        <Image
          src="/pageant_calendar_full_lg.webp"
          width={400}
          height={120}
          className="w-full h-auto"
          alt="Pageant Calendar"
          {...props}
        />
      );
    case LogoType.PAGEANT_SMALL:
      return (
        <Image
          src="/pageant_calendar_sm_white.webp"
          width={113}
          height={124}
          className="w-full h-auto"
          alt="Pageant Calendar"
          {...props}
        />
      );
    case LogoType.MEA:
      return <MeaLogo />;
    case LogoType.MEA_SM:
      return <MeaLogoSm />;
    case LogoType.GOOGLE:
      return <GoogleLogo />;
    default:
      return (
        <Image
          src="/pageant_calendar_full_lg.webp"
          width={400}
          height={120}
          className="w-full h-auto"
          alt="Pageant Calendar"
          {...props}
        />
      );
  }
};
