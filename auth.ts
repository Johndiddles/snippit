import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import { createUser, CreateUserPayload } from "./db/models/createUser";

export const { signIn, signOut, handlers, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [Github],
  callbacks: {
    async signIn({ user, profile }) {
      // console.log({ profile });
      if (!user || !profile) {
        return false;
      }
      const userToDb: CreateUserPayload = {
        user_provider_id: profile.id!,
        username: profile.name!,
        email: profile.email!,
        authProvider: "github",
        profileImage: (profile.avatar_url as string) || "",
      };

      const { user: updatedUser, error } = await createUser(
        userToDb as CreateUserPayload
      );

      if (error) {
        console.error({ error });
        return `/signin/error?error=${error}`;
      }

      console.log({ updatedUser });
      user.id = updatedUser!._id?.toString();
      user.image = updatedUser?.profileImage;
      user.name = updatedUser?.username;
      user.email = updatedUser?.email;
      return true;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub!,
      };
      return session;
    },
  },
});
