"use server";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findFirst({ where: { email } });
};

export const signUp = async (
  email: string,
  password: string,
  firstName: string,
  surname: string,
): Promise<
  { success: true; user: User } | { success: false; error: string }
> => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return {
      success: false,
      error: "Email address already in use, please change and try again",
    };

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      surname,
      password: hashedPassword,
      provider: "MANUAL",
    },
  });

  return { success: true, user };
};
