"use server";
import prisma from "@/lib/prisma";
import { Event } from "@prisma/client";

export type EventDTO = Pick<
  Event,
  | "id"
  | "title"
  | "description"
  | "startDate"
  | "endDate"
  | "updatedAt"
  | "contactFirstName"
  | "contactLastName"
  | "contactPhone"
  | "contactEmail"
>;

export const createEvent = async (eventData: EventDTO): Promise<EventDTO> => {
  return await prisma.event.create({ data: eventData });
};

export const getEvents = async (): Promise<EventDTO[]> => {
  return await prisma.event.findMany({ where: { deletedAt: null } });
};

export const updateEvent = async (eventData: EventDTO): Promise<EventDTO> => {
  const { id, ...data } = eventData;
  return await prisma.event.update({ where: { id }, data });
};

export const deleteEvent = async (eventData: EventDTO): Promise<EventDTO> => {
  return await prisma.event.update({
    where: { id: eventData.id },
    data: { deletedAt: new Date() },
  });
};
