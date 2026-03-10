"use server";
import prisma from "@/lib/prisma";
import { Event } from "@prisma/client";

export type EventDTO = Event;

export const createEvent = async (
  eventData: Omit<EventDTO, "id">,
): Promise<EventDTO> => {
  const event = await prisma.event.create({ data: eventData });
  return event;
};

export const getEvents = async (): Promise<EventDTO[]> => {
  return await prisma.event.findMany({});
};

export const updateEvent = async (eventData: EventDTO): Promise<EventDTO> => {
  const { id, ...data } = eventData;
  const event = await prisma.event.update({
    where: { id },
    data,
  });
  return event;
};
