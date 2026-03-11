"use server";
import prisma from "@/lib/prisma";
import { Event } from "@prisma/client";

export type EventDTO = Pick<
  Event,
  "title" | "description" | "startDate" | "endDate" | "updatedAt" | "id"
>;

export const createEvent = async (eventData: EventDTO): Promise<EventDTO> => {
  const event = await prisma.event.create({ data: eventData });
  return event;
};

export const getEvents = async (): Promise<EventDTO[]> => {
  return await prisma.event.findMany({
    where: { deletedAt: null },
  });
};

export const updateEvent = async (eventData: EventDTO): Promise<EventDTO> => {
  const { id, ...data } = eventData;
  const event = await prisma.event.update({
    where: { id },
    data,
  });
  return event;
};

export const deleteEvent = async (eventData: EventDTO): Promise<EventDTO> => {
  const event = await prisma.event.update({
    where: { id: eventData.id },
    data: { deletedAt: new Date() },
  });
  return event;
};
