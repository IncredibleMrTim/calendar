import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import { AuthProvider } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        return isValid ? user : null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!dbUser) return false;
        if (dbUser.provider !== AuthProvider.GOOGLE) {
          await prisma.user.update({
            where: { email: user.email },
            data: { provider: AuthProvider.GOOGLE },
          });
        }
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/";
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? token.id ?? "";
        session.user.role = token.role || "USER";
        session.user.name = `${token.firstName} ${token.lastName}`;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.picture = token.picture;
        session.accessToken = token.accessToken as string | undefined;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!dbUser) return token;

        token.id = dbUser.id;
        token.email = dbUser.email;
        token.name = user.name;
        token.role = dbUser.role;
        token.firstName = dbUser.firstName;
        token.lastName = dbUser.surname;
      }

      if (!user && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        token.role = dbUser?.role || "USER";
      }

      if (profile) {
        const googleProfile = profile as GoogleProfile;
        token.firstName = googleProfile?.given_name || "";
        token.lastName = googleProfile?.family_name || "";
        token.picture = googleProfile?.picture || "";
      }

      if (account) {
        token.accessToken = account.access_token;
      }

      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
