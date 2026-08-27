import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const inputEmail = credentials.email.trim().toLowerCase();
        const inputPassword = credentials.password;

        const configuredAdminUser = (process.env.ADMIN_USER || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
        const configuredAdminPass = process.env.ADMIN_PASS?.trim();

        // 1. Check in database
        let user = await prisma.adminUser.findFirst({
          where: {
            email: inputEmail,
          },
        });

        // 2. If user exists in DB, compare passwords
        if (user) {
          const passwordMatches = await bcrypt.compare(
            inputPassword,
            user.password,
          );

          if (passwordMatches) {
            return {
              id: user.id,
              email: user.email,
              name: user.name ?? user.email,
            };
          }
        }

        // 3. Fallback / Sync from configured ADMIN_USER & ADMIN_PASS in environment
        if (
          configuredAdminUser &&
          inputEmail === configuredAdminUser &&
          configuredAdminPass &&
          inputPassword === configuredAdminPass
        ) {
          try {
            const hashedPassword = await bcrypt.hash(inputPassword, 10);
            if (user) {
              user = await prisma.adminUser.update({
                where: { id: user.id },
                data: { password: hashedPassword },
              });
            } else {
              user = await prisma.adminUser.create({
                data: {
                  email: inputEmail,
                  password: hashedPassword,
                  name: "MM Laptop Center Admin",
                },
              });
            }
          } catch {
            // ignore fallback DB error
          }

          return {
            id: user?.id ?? "admin-1",
            email: inputEmail,
            name: user?.name ?? "MM Laptop Center Admin",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? "mmlaptop-dev-secret",
};
