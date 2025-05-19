import { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "next-auth";
import axios from "axios";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }
  
  interface User {
    id: string;
    token?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // Connect to Django's login endpoint
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login/`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
          
          // With axios, we automatically get parsed JSON in response.data
          const data = response.data;
          
          // Django Rest Auth typically returns a key (token) on successful login
          if (response.status >= 200 && response.status < 300 && data) {
            // This structure matches Django Rest Auth's response format
            return {
              id: data.user?.pk || data.user?.id || data.id || '1',
              email: credentials.email,
              name: data.user?.username || data.username || credentials.email,
              token: data.key || data.token || data.access_token,
            };
          }
          
          return null;
        } catch (error) {
          if (axios.isAxiosError(error) && process.env.NODE_ENV === "development") {
            console.error("Auth error status:", error.response?.status);
          }
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/login/",
    signOut: "/auth/logout/",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - only update session once per day
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Only log during development and actual sign in
        if (process.env.NODE_ENV === "development") {
          console.log("JWT callback - user signed in");
        }
        return {
          ...token,
          accessToken: user.token,
          id: user.id,
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Remove verbose session logging
      if (session.user) {
        session.user.id = token.id as string;
        // Add access token to the session if needed
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  debug: process.env.AUTH_DEBUG === "true",
};