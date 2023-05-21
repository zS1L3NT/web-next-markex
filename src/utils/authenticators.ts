import { withIronSessionSsr } from "iron-session/next"

import { SessionUser } from "@/@types/iron-session"

export const ProtectedRoute = withIronSessionSsr<{ user: SessionUser }>(
	async function handle({ req, res }) {
		const user = req.session.user

		if (user) {
			return {
				props: {
					user
				}
			}
		} else {
			return {
				notFound: true
			}
		}
	},
	{
		cookieName: process.env.COOKIE_NAME,
		password: process.env.COOKIE_PASSWORD,
		cookieOptions: {
			secure: process.env.NODE_ENV === "production"
		}
	}
)

export const PublicRoute = withIronSessionSsr<{ user: SessionUser | null }>(
	async function handle({ req, res }) {
		return {
			props: {
				user: req.session.user ?? null
			}
		}
	},
	{
		cookieName: process.env.COOKIE_NAME,
		password: process.env.COOKIE_PASSWORD,
		cookieOptions: {
			secure: process.env.NODE_ENV === "production"
		}
	}
)
