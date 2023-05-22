import { IronSession } from "iron-session"
import { withIronSessionSsr } from "iron-session/next"
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next"

import getSessionUser from "./getSessionUser"

const withSession = <Props extends Record<string, any> = {}>(
	handler: (
		context: GetServerSidePropsContext<any, any> & { session: IronSession }
	) => Promise<GetServerSidePropsResult<Props>>
) =>
	withIronSessionSsr<Props>(
		async context =>
			await handler({
				...context,
				session: {
					...context.req.session,
					user: context.req.session.fidor_access_token
						? await getSessionUser(context.req.session.fidor_access_token)
						: context.req.session.user ?? undefined
				}
			}),
		{
			cookieName: process.env.COOKIE_NAME,
			password: process.env.COOKIE_PASSWORD,
			cookieOptions: {
				secure: process.env.NODE_ENV === "production"
			}
		}
	)

export default withSession
