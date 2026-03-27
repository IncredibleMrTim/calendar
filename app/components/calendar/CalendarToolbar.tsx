import { useState } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
import { UserMenu, MenuItemType } from "../userMenu/UserMenu";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { CalendarView } from "@/stores/useCalendarStore";
import { useCalendarStore } from "@/stores/useCalendarStore";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import Image from "next/image";
import { LuPlus } from "react-icons/lu";
import { Drawer } from "../drawers/Drawer";
import { ContactFormTemplate } from "../drawers/templates/ContactForm.template";
import { Logos, LogoType } from "../logo/Logos";

interface CalendarToolbarProps {
  currentDate: Date;
  onNavigate: (action?: "PREV" | "NEXT" | "TODAY", selectedDate?: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onCreateEvent: () => void;
}

const getViewLabel = (view: CalendarView): string => {
  const labels: Record<CalendarView, string> = {
    [CalendarView.DAY]: "Day",
    [CalendarView.WEEK]: "Week",
    [CalendarView.MONTH]: "Month",
    [CalendarView.AGENDA]: "Agenda",
    [CalendarView.WORK_WEEK]: "Work Week",
  };
  return `Viewing: ${labels[view]}`;
};

export const CalendarToolbar = ({
  currentDate,
  onNavigate,
  onViewChange,
  onCreateEvent,
}: CalendarToolbarProps) => {
  const currentView = useCalendarStore((state) => state.currentView);
  const { data: session } = useSession();
  const [showContactDrawer, setShowContactDrawer] = useState(false);

  const handleMenuItemClick = (item: MenuItemType) => {
    if (item === MenuItemType.CONTACT) {
      setShowContactDrawer(true);
    }
  };

  const getViewDateFormat = () => {
    switch (currentView) {
      case CalendarView.DAY:
        return format(currentDate, "EEE MMMM do yyyy");
      case CalendarView.WEEK:
        return `${format(startOfWeek(currentDate), "do")} - ${format(endOfWeek(currentDate), "do")} ${format(currentDate, "MMMM")} ${format(currentDate, "yyyy")}`;
      case CalendarView.MONTH:
        return format(currentDate, "MMMM yyyy");
      default:
        return "Agenda";
    }
  };

  return (
    <>
      <div className="relative flex flex-col-reverse md:flex-row md:justify-between md:items-end items-center p-2 border-b">
        <div className="flex gap-2 justify-center items-center md:justify-start md:items-end">
          <div className="w-60  hidden md:flex p-2">
            <Logos type={LogoType.PAGEANT_FULL} />
          </div>
          <div className="w-max-150">
            <DatePicker
              aria-label="Select calendar date"
              placeholder={format(currentDate, "MMMM")}
              onSelect={(selected: Date | undefined) =>
                onNavigate(undefined, selected)
              }
            />
          </div>
          <>
            <Select
              value={currentView}
              onValueChange={onViewChange}
              aria-label="Select calendar view"
            >
              <SelectTrigger className="w-full max-w-37 border-0 shadow-none ring-0">
                <SelectValue>
                  <div className="text-gray-500!">
                    {getViewLabel(currentView)}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value={CalendarView.DAY}>Day</SelectItem>
                <SelectItem value={CalendarView.WEEK}>Week</SelectItem>
                <SelectItem value={CalendarView.MONTH}>Month</SelectItem>
                <SelectItem value={CalendarView.AGENDA}>Agenda</SelectItem>
              </SelectContent>
            </Select>
          </>
        </div>

        <h2 className="text-lg font-semibold md:absolute md:left-1/2 md:-translate-x-1/2">
          {getViewDateFormat()}
        </h2>

        <div className="flex w-full md:w-auto items-center justify-center md:justify-end gap-4 ">
          <div className="flex gap-4 items-center">
            {session?.user.role === UserRole.ADMIN && (
              <Button
                variant="outline"
                className="hidden md:flex"
                onClick={() => onCreateEvent()}
              >
                <LuPlus /> Add Event
              </Button>
            )}
            <div className="absolute md:static top-1 left-0">
              <UserMenu onMenuItemClick={handleMenuItemClick} />
            </div>
          </div>
        </div>
      </div>

      <Drawer
        open={showContactDrawer}
        onClose={() => setShowContactDrawer(false)}
      >
        <ContactFormTemplate onClose={() => setShowContactDrawer(false)} />
      </Drawer>
    </>
  );
};
