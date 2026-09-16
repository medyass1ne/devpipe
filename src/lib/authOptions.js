import GithubProvider from "next-auth/providers/github";
import mongoose from "mongoose";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "github") {
        try {
          if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URI);
          }
          const githubId = profile.id.toString();
          const existingUser = await User.findOneAndUpdate(
            { githubId },
            { name: user.name, email: user.email, image: user.image },
            { upsert: true, new: true }
          );
          user.mongoId = existingUser._id.toString();
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, profile }) {
      if (user?.mongoId) {
        token.mongoId = user.mongoId;
      } else if (profile) {
        if (mongoose.connection.readyState !== 1) await mongoose.connect(process.env.MONGO_URI);
        const dbUser = await User.findOne({ githubId: profile.id.toString() });
        if (dbUser) token.mongoId = dbUser._id.toString();
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.mongoId) {
        session.user.id = token.mongoId;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_dev",
};
