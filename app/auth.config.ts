import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      console.log("User:", dbUser);
      return !!dbUser;
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
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.picture = token.picture;
        session.accessToken = token.accessToken as string | undefined;
      }
      console.log(
        "🔐 [SESSION CALLBACK] User role:",
        session.user?.role,
        "Email:",
        session.user?.email,
      );
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
        console.log(
          "🔐 [JWT CALLBACK - NEW USER] Email:",
          user.email,
          "Role:",
          dbUser.role,
        );
      }

      if (!user && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        token.role = dbUser?.role || "USER";
        console.log(
          "🔐 [JWT CALLBACK - EXISTING USER] Email:",
          token.email,
          "Role:",
          token.role,
        );
      }

      if (profile) {
        const googleProfile = profile as any;
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
