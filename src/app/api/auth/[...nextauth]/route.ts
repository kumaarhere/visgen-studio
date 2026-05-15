import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /**
     * jwt callback — runs when the token is created or refreshed.
     * We embed id/credits/plan here so the session callback never needs
     * to hit the database on every request.
     */
    async jwt({ token, account, trigger, session: sessionUpdate }) {
      // Initial sign-in: load the user from DB and embed into the token
      if (account) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.credits = dbUser.credits;
          token.plan = dbUser.plan;
        }
      }

      // Explicit refresh (called via update() in auth-context after generation/payment)
      if (trigger === "update") {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.credits = dbUser.credits;
          token.plan = dbUser.plan;
        }
      }

      return token;
    },

    /**
     * session callback — just maps the JWT token fields to session.user.
     * No DB calls here.
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).credits = token.credits;
        (session.user as any).plan = token.plan;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            await User.create({
              email: user.email,
              displayName: user.name,
              avatarUrl: user.image,
              credits: 15,
              plan: "free",
              creditsResetAt: new Date(),
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving user", error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
