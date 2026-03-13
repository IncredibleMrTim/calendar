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

  // Actions
  setCurrentView: (view: CalendarView) => void;
}

export const useCalendarStore = create<CalendarStore>()(
  devtools(
    (set) => ({
      currentView: CalendarView.MONTH,

      setCurrentView: (view: CalendarView) => {
        set({ currentView: view }, false, "setCurrentView");
      },
    }),
    {
      name: "CalendarStore",
    },
  ),
);
