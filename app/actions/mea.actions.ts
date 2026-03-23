"use server";

import prisma from "@/lib/prisma";
import { Event } from "@prisma/client";
import Groq from "groq-sdk";
import { ChatRole } from "@/types/mea.types";

// Groq client — API key loaded from env
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Model can be overridden via GROQ_MODEL env var
const groqModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

// Message shape used in chat history passed to Groq
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Discriminated union — either a plain text response or a list of matching events
export type MeaResult =
  | { type: "message"; content: string }
  | { type: "events"; events: Event[]; content: string };

// Shape of the structured JSON Groq returns from the intent step
interface Intent {
  intent: "search" | "chat";
  keywords: string[];
  startDate?: string;
  endDate?: string;
  chatResponse?: string;
}

// Words that should never appear as search keywords.
// Acts as a safety net in case Groq includes generic terms despite prompt instructions.
const STOP_WORDS = new Set([
  "find",
  "show",
  "get",
  "list",
  "all",
  "events",
  "event",
  "calendar",
  "any",
  "me",
  "in",
  "on",
  "at",
  "the",
  "a",
  "an",
  "for",
  "of",
  "and",
  "or",
  "is",
  "are",
  "was",
  "were",
]);

// Summarises a full chat history into 1-2 sentences.
// Called when history reaches 10 messages — the summary replaces old context
// so token usage stays flat regardless of conversation length.
export const summarizeHistory = async (
  history: ChatMessage[],
): Promise<string> => {
  try {
    const res = await client.chat.completions.create({
      model: groqModel,
      messages: [
        {
          role: "system",
          content: `Summarize this conversation in 1-2 sentences, focusing only on what the user searched for and what was found. Be concise.`,
        },
        ...history,
      ],
    });
    return res.choices[0].message.content ?? "";
  } catch {
    return "";
  }
};

// Main MEA action — handles both event search and general chat.
// Flow:
//   1. Ask Groq to classify intent and extract filters (single call)
//   2. Strip stop words from keywords as a safety net
//   3. If chat → return Groq's conversational response
//   4. If search → query Prisma with date range and/or keywords
//   5. Return matching events or a "not found" message
export const meaAction = async (
  query: string,
  history: ChatMessage[], // last 5 messages (capped in component)
  summary?: string, // optional summary of older conversation context
): Promise<MeaResult> => {
  // Step 1: classify intent and extract search filters in one Groq call
  let intentRes;
  try {
    intentRes = await client.chat.completions.create({
      model: groqModel,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are MEA, a read-only calendar assistant for the MEA Calendar. Today: ${new Date().toISOString()}.
Correct spelling. Never say "your calendar", say "the MEA Calendar".
Read-only: no create/edit/delete — if asked, set intent "chat", direct user to contact support.
Advertising queries: set intent "chat", suggest contacting the support team (vary wording).
Date range >12 months: set intent "chat", ask user to refine search.${summary ? `\nConversation so far: ${summary}` : ""}
Return JSON only:
- "intent": "search"|"chat"
- "keywords": proper nouns only — specific event titles or contact names. NEVER include: find, show, get, list, all, events, calendar, any, me, in, on, at, or any month/year/date word. Empty array for date-only queries like "events in march".
- "startDate": ISO string (omit if none). Months/years/relative terms → dates, never keywords.
- "endDate": ISO string (omit if none)
- "chatResponse": conversational reply (intent "chat" only)`,
        },
        ...history,
        { role: ChatRole.USER, content: query },
      ],
    });
  } catch {
    return { type: "message", content: "I'm having trouble connecting right now. Please try again in a moment." };
  }

  let intent: Intent;
  try {
    intent = JSON.parse(
      intentRes.choices[0].message.content ??
        '{"intent":"chat","keywords":[],"chatResponse":"Sorry, I had trouble understanding that."}',
    );
  } catch {
    return { type: "message", content: "Sorry, I had trouble understanding that." };
  }

  // Step 2: strip any stop words Groq may have included despite instructions
  intent.keywords = (intent.keywords ?? []).filter(
    (k) => !STOP_WORDS.has(k.toLowerCase()),
  );

  // Step 3: general chat — return Groq's response directly
  if (intent.intent === "chat") {
    return {
      type: "message",
      content:
        intent.chatResponse ?? "Sorry, I had trouble understanding that.",
    };
  }

  // Step 4: build Prisma where clause
  // Date range and keywords are combined with AND logic if both are present
  const validDate = (s: string) => { const d = new Date(s); return isNaN(d.getTime()) ? undefined : d; };
  const startDate = intent.startDate ? validDate(intent.startDate) : undefined;
  const endDate = intent.endDate ? validDate(intent.endDate) : undefined;

  const where: object = {
    deletedAt: null,
    ...(startDate || endDate
      ? {
          startDate: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }
      : {}),
    ...(intent.keywords.length > 0
      ? {
          OR: intent.keywords.flatMap((keyword) => [
            { title: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
            { contactFirstName: { contains: keyword, mode: "insensitive" } },
            { contactLastName: { contains: keyword, mode: "insensitive" } },
          ]),
        }
      : {}),
  };

  const events = await prisma.event.findMany({ where, take: 20 });

  // Step 5: return results or a not-found message
  if (events.length === 0) {
    return {
      type: "message",
      content:
        "I couldn't find any events matching your search. Try different keywords or a different date range.",
    };
  }

  return {
    type: "events",
    events,
    content: `I found ${events.length} event${events.length > 1 ? "s" : ""} for you.`,
  };
};
