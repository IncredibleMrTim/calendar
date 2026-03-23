"use client";
import { useState, useEffect, useRef } from "react";
import { Event } from "@prisma/client";
import {
  meaAction,
  summarizeHistory,
  ChatMessage,
  MeaResult,
} from "@/actions/mea.actions";
import { ChatRole } from "@/types/mea.types";
import { Card, CardContent } from "../ui/card";
import { useCalendarStore } from "@/stores/useCalendarStore";
import { useEventStore } from "@/stores/useEventStore";
import { EventDTO } from "@/actions/events.action";
import { Input } from "../ui/input";
import { format } from "date-fns";
import { LogoSm } from "../logo/LogoSm";
import { LuArrowUp, LuChevronDown, LuMessagesSquare } from "react-icons/lu";
import { Button } from "../ui/button";

interface ChatEntry {
  id: number;
  role: ChatRole;
  result: MeaResult;
}

export const MeaChat = () => {
  const setCurrentDate = useCalendarStore((state) => state.setCurrentDate);
  const onSelectEvent = useEventStore((state) => state.onSelectEvent);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [summary, setSummary] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [chatHidden, setChatHidden] = useState(true);
  const messagesRef = useRef<HTMLDivElement>(null);
  const entryIdRef = useRef(0);
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [history, loading]);

  const handleSend = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      let currentSummary = summary;
      let currentHistory = history;

      if (history.length >= 10) {
        const chatHistory: ChatMessage[] = history.map((entry) => ({
          role: entry.role,
          content: entry.result.content,
        }));
        currentSummary = await summarizeHistory(chatHistory);
        currentHistory = history.slice(-5);
        setSummary(currentSummary);
        setHistory(currentHistory);
      }

      const chatHistory: ChatMessage[] = currentHistory
        .slice(-5)
        .map((entry) => ({
          role: entry.role,
          content: entry.result.content,
        }));

      const result = await meaAction(query, chatHistory, currentSummary);

      setHistory((prev) => [
        ...prev,
        { id: entryIdRef.current++, role: ChatRole.USER, result: { type: "message", content: query } },
        { id: entryIdRef.current++, role: ChatRole.ASSISTANT, result },
      ]);
      setQuery("");
    } catch {
      setHistory((prev) => [
        ...prev,
        { id: entryIdRef.current++, role: ChatRole.USER, result: { type: "message", content: query } },
        { id: entryIdRef.current++, role: ChatRole.ASSISTANT, result: { type: "message", content: "Something went wrong. Please try again." } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed bottom-4 right-4 ${chatHidden ? "flex" : "hidden"} z-10 w-10 h-10 bg-red-200 justify-center items-center rounded-full shadow-md`}
        onClick={() => setChatHidden(false)}
      >
        <LuMessagesSquare size="20" />
      </div>
      <Card
        className={`${chatHidden ? "hidden" : ""} flex-col fixed md:absolute top-0 md:top-auto left-0 md:left-auto md:bottom-2 md:right-4 w-full md:w-80 h-full md:h-125 z-10 shadow-lg overflow-hidden py-0 rounded-none md:rounded-md`}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b bg-secondary text-primary justify-between">
          <div className="w-10">
            <LogoSm />
          </div>
          <span className="font-semibold text-sm flex-1">
            Calendar Event Assistant
          </span>
          <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
          <div onClick={() => setChatHidden(true)}>
            <LuChevronDown />
          </div>
        </div>

        {/* Messages */}
        <CardContent
          ref={messagesRef}
          className="flex flex-col flex-1 overflow-y-auto gap-3 p-4 min-h-0"
        >
          {history.length === 0 && !loading && (
            <div className="self-start max-w-[80%] bg-muted text-muted-foreground rounded-2xl rounded-tl-sm px-4 py-2 text-sm">
              Hi! I am MEA, your event assistant. Ask me anything or search for
              any events in my calendar.
            </div>
          )}
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`flex ${entry.role === ChatRole.USER ? "justify-end" : "justify-start"}`}
            >
              {entry.result.type === "message" && (
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    entry.role === ChatRole.USER
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-muted-foreground rounded-tl-sm"
                  }`}
                >
                  {entry.result.content}
                </div>
              )}
              {entry.result.type === "events" && (
                <div className="self-start max-w-[80%] bg-muted rounded-2xl rounded-tl-sm px-4 py-2 text-sm flex flex-col gap-2">
                  <p className="text-muted-foreground">
                    {entry.result.content}
                  </p>
                  {entry.result.events.map((event: Event) => (
                    <div key={event.id} className="border-t pt-2">
                      <p
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={() => {
                          setCurrentDate(new Date(event.startDate));
                          onSelectEvent(event as EventDTO);
                          setChatHidden(true);
                        }}
                      >
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(event.startDate, "dd/MM/yy - HH:mm")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="self-start max-w-[80%] bg-muted text-muted-foreground rounded-2xl rounded-tl-sm px-4 py-2 text-sm animate-pulse">
              Thinking...
            </div>
          )}
        </CardContent>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 border-t bg-gray-50">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask something..."
            className="flex-1 rounded-full text-sm bg-white"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !query.trim()}
            variant="outline"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-200 hover:bg-blue-100"
          >
            <LuArrowUp />
          </Button>
        </div>
      </Card>
    </>
  );
};
