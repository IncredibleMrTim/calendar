"use client";
import { cva } from "class-variance-authority";
import {
  Drawer as ShadDrawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { useEventStore } from "@/stores/useEventStore";
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
  allowDismiss?: boolean;
  children: ReactNode;
}

export const Drawer = ({ children, allowDismiss = true }: DrawerProps) => {
  const selectedEvent = useEventStore((state) => state.selectedEvent);
  const isCreating = useEventStore((state) => state.isCreating);
  const handleEventClose = useEventStore((state) => state.handleEventClose);

  const isMobile = useIsMobile();
  const isOpen = !!selectedEvent || isCreating;

  return (
    <ShadDrawer
      open={isOpen}
      direction={isMobile ? "bottom" : "right"}
      onClose={allowDismiss ? handleEventClose : undefined}
      shouldScaleBackground={false}
      dismissible={false}
    >
      <DrawerContent
        className={drawerContent({ device: isMobile ? "mobile" : "desktop" })}
        onOverlayClick={
          !isMobile && allowDismiss ? handleEventClose : undefined
        }
      >
        {children}
      </DrawerContent>
    </ShadDrawer>
  );
};
