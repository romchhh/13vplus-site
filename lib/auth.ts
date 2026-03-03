import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          throw new Error("Будь ласка, введіть email та пароль");
        }

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Невірний email або пароль");
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Невірний email або пароль");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as { id?: string }).id = (user as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = (token as { id?: string }).id ?? "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
