import { format, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
import { AuthUserMenu } from "../auth/authUserMenu/AuthUserMenu";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { CalendarView } from "@/stores/useCalendarStore";
import { useCalendarStore } from "@/stores/useCalendarStore";

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
  return `View: ${labels[view]}`;
};

export const CalendarToolbar = ({
  currentDate,
  onNavigate,
  onViewChange,
  onCreateEvent,
}: CalendarToolbarProps) => {
  const currentView = useCalendarStore((state) => state.currentView);

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
    <div className="flex flex-col-reverse md:flex-row justify-between items-center p-2 bg-gray-50 border-b">
      <div className="flex gap-2 justify-start">
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
            <SelectTrigger className="w-full max-w-48 border-0 shadow-none ring-0">
              <SelectValue>{getViewLabel(currentView)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CalendarView.DAY}>Day</SelectItem>
              <SelectItem value={CalendarView.WEEK}>Week</SelectItem>
              <SelectItem value={CalendarView.MONTH}>Month</SelectItem>
              <SelectItem value={CalendarView.AGENDA}>Agenda</SelectItem>
            </SelectContent>
          </Select>
        </>
      </div>
      <div className="flex gap-4 flex-nowrap items-center">
        <h2 className="text-lg font-semibold">{getViewDateFormat()}</h2>
        <Button
          className="px-3 py-1 bg-green-500 text-white"
          onClick={() => onCreateEvent()}
        >
          + Add Event
        </Button>
        <AuthUserMenu />
      </div>
    </div>
  );
};
