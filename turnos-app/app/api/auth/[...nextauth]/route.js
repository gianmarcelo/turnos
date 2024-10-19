// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';

const client = new Client({
  connectionString: process.env.DATABASE_URL_CLIENTES,
});

await client.connect();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Verifica si el usuario existe en la base de datos
        const res = await client.query('SELECT * FROM clientes WHERE email = $1', [email]);
        const user = res.rows[0];

        if (user && user.password) {
          const isPasswordValid = bcrypt.compare(password, user.password);
          if (isPasswordValid) {
            return { id: user.id_cliente, email: user.email };
          }
        }
        return null; // Retorna null si la autenticación falla
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
