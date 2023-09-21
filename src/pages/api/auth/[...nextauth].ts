import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE__CLIENT_ID,
			clientSecret: process.env.GOOGLE__CLIENT_SECRET,
		}),
	],
	callbacks: {
		session: async ({ session, token }) => {
			session.user.id = token.sub as string
			return session
		},
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH__JWT_SECRET,
} satisfies AuthOptions

export default NextAuth(authOptions)
