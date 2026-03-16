"use server";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findFirst({ where: { email } });
};
