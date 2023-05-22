import { IronSession } from "iron-session"
import { withIronSessionApiRoute } from "iron-session/next"
import { NextApiRequest, NextApiResponse } from "next"

const withApiSession = (
	handler: (context: { req: NextApiRequest; res: NextApiResponse; session: IronSession }) => void
) =>
	withIronSessionApiRoute(async (req, res) => await handler({ req, res, session: req.session }), {
		cookieName: process.env.COOKIE_NAME,
		password: process.env.COOKIE_PASSWORD,
		cookieOptions: {
			secure: process.env.NODE_ENV === "production"
		}
	})

export default withApiSession
