import { create } from "zustand";
import { devtools } from "zustand/middleware";

export enum CalendarView {
  DAY = "day",
  WEEK = "week",
  WORK_WEEK = "work_week",
  MONTH = "month",
  AGENDA = "agenda",
}

interface CalendarStore {
  currentView: CalendarView;
  currentDate: Date;

  // Actions
  setCurrentView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
}

export const useCalendarStore = create<CalendarStore>()(
  devtools(
    (set) => ({
      currentView: CalendarView.MONTH,
      currentDate: new Date(),

      setCurrentView: (view: CalendarView) => {
        set({ currentView: view }, false, "setCurrentView");
      },
      setCurrentDate: (date: Date) => {
        set({ currentDate: date }, false, "setCurrentDate");
      },
    }),
    {
      name: "CalendarStore",
    },
  ),
);
