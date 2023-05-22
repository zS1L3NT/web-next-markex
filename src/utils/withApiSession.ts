import { IronSession } from "iron-session"
import { withIronSessionApiRoute } from "iron-session/next"
import { NextApiRequest, NextApiResponse } from "next"

import getSessionUser from "./getSessionUser"

const withApiSession = (
	handler: (context: { req: NextApiRequest; res: NextApiResponse; session: IronSession }) => void
) =>
	withIronSessionApiRoute(
		async (req, res) => {
			req.session.user = req.session.fidor_access_token
				? await getSessionUser(req.session.fidor_access_token)
				: req.session.user

			await handler({
				req,
				res,
				session: req.session
			})
		},
		{
			cookieName: process.env.COOKIE_NAME,
			password: process.env.COOKIE_PASSWORD,
			cookieOptions: {
				secure: process.env.NODE_ENV === "production"
			}
		}
	)

export default withApiSession
