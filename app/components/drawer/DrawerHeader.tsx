import { LuX } from "react-icons/lu";
import { DrawerHeader as ShadDrawerHeader } from "../ui/drawer";
import { Logos, LogoType } from "../logo/Logos";

interface DrawerHeaderProps extends React.ComponentProps<
  typeof ShadDrawerHeader
> {
  onClose?: () => void;
  title?: string;
}

export const DrawerHeader = ({
  onClose,
  title,
  ...props
}: DrawerHeaderProps) => {
  return (
    <ShadDrawerHeader
      className="bg-white border-b border-zinc-100 py-4 flex flex-row items-center gap-2 shrink-0 rounded-t-md justify-between"
      {...props}
    >
      <div className="flex gap-2 items-center">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          aria-label="Close"
        >
          <LuX size={18} />
        </button>
        {title && (
          <p className="font-medium text-zinc-400 uppercase tracking-widest">
            {title}
          </p>
        )}
      </div>
      <Logos type={LogoType.PAGEANT_SMALL} className="w-8 ml-auto" />
    </ShadDrawerHeader>
  );
};
