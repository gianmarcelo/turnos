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
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
        mobileNumber: { label: "Mobile Number", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const { email, password, mobileNumber, otp } = credentials;

        // Verifica si el usuario existe en la base de datos
        const res = await client.query('SELECT * FROM clientes WHERE email = $1', [email]);
        const user = res.rows[0];

        // Verifica el número móvil si no se proporciona un email y password
        const resnumber = await client.query('SELECT * FROM clientes WHERE numberclient = $1', [mobileNumber]);
        const usernumber = resnumber.rows[0];

        if (email && password) {
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (isPasswordValid) {
            return { id: user.id_cliente, email: user.email };
          }
        } else if (mobileNumber && otp) {
          // Si el OTP es válido, eliminamos el OTP de la base de datos
          const isOtpValid = await bcrypt.compare(otp, usernumber.onetimepassword);
          if (isOtpValid) {
            await client.query(
              'UPDATE clientes SET onetimepassword = NULL WHERE numberclient = $1',
              [mobileNumber]
            );
            return { id: usernumber.id_cliente, email: usernumber.email };
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
  // Cerramos la conexión a la base de datos después de cada petición
  events: {
    async error(message) {
      await client.end(); // Cierra la conexión si ocurre un error
      console.error(message);
    },
    async signIn(message) {
      await client.end(); // Cierra la conexión después de iniciar sesión
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
