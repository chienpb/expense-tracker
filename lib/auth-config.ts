import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verifyPassword } from './password';
import { getSupabase } from './supabase';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const supabase = getSupabase();
        const { data: user, error } = await supabase
          .from('users')
          .select('id, email, password_hash, role')
          .eq('email', email)
          .single();

        if (error || !user) return null;

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) return null;

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? '';
      session.user.role = token.role;
      return session;
    },
  },
});
