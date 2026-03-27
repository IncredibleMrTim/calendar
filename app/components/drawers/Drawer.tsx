"use client";
import { cva } from "class-variance-authority";
import { Drawer as ShadDrawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ReactNode } from "react";

const drawerContent = cva("bg-transparent border-none shadow-none", {
  variants: {
    device: {
      mobile: "h-[100dvh] max-h-[100dvh] mt-0! rounded-t-xl",
      desktop: "md:max-w-130! h-full p-2",
    },
  },
});

interface DrawerProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export const Drawer = ({ open, onClose, children }: DrawerProps) => {
  const isMobile = useIsMobile();

  return (
    <ShadDrawer
      open={open}
      direction={isMobile ? "bottom" : "right"}
      onClose={onClose}
      shouldScaleBackground={false}
      dismissible={false}
    >
      <DrawerContent
        className={drawerContent({ device: isMobile ? "mobile" : "desktop" })}
        onOverlayClick={onClose}
      >
        {children}
      </DrawerContent>
    </ShadDrawer>
  );
};
