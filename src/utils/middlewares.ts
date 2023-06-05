import { IronSession } from "iron-session"
import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next"
import {
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	NextApiRequest,
	NextApiResponse,
} from "next"

import { Transaction } from "@prisma/client"

import { User } from "@/@types/types"
import { CURRENCY_PAIR } from "@/constants"
import prisma from "@/prisma"

const getUser = async (session: IronSession): Promise<User | null> => {
	const { fidor } = session
	if (!fidor) return null

	const user_id = fidor.user.id ?? ""

	return {
		id: user_id,
		app: {
			bookmarks: await prisma.bookmark
				.findMany({ select: { currency_pair: true }, where: { user_id } })
				.then(bs => bs.map(b => b.currency_pair as CURRENCY_PAIR)),
			balances: await prisma.balance
				.findMany({ where: { user_id } })
				.then(bs => Object.fromEntries(bs.map(b => [b.currency, b.amount]))),
			transactions: await prisma.transaction
				.findMany({
					where: { user_id },
					orderBy: { created_at: "asc" },
				})
				.then(txs =>
					txs.map(
						tx =>
							({
								...tx,
								created_at: tx.created_at.getTime(),
							} as Exclude<Transaction, "created_at"> & { created_at: number }),
					),
				),
		},
		fidor: fidor.user,
	}
}

export const withApiSession = (
	handler: (context: {
		req: NextApiRequest
		res: NextApiResponse
		session: IronSession
		user: User | null
	}) => void,
) =>
	withIronSessionApiRoute(
		async (req, res) =>
			await handler({
				req,
				res,
				session: req.session,
				user: await getUser(req.session),
			}),
		{
			cookieName: process.env.COOKIE_NAME,
			password: process.env.COOKIE_PASSWORD,
			cookieOptions: {
				secure: process.env.NODE_ENV === "production",
			},
		},
	)

export const withSession = <Props extends Record<string, any>>(
	handler: (
		context: GetServerSidePropsContext<any, any> & { session: IronSession; user: User | null },
	) => Promise<GetServerSidePropsResult<Props>>,
) =>
	withIronSessionSsr<Props>(
		async context =>
			await handler({
				...context,
				session: context.req.session,
				user: await getUser(context.req.session),
			}),
		{
			cookieName: process.env.COOKIE_NAME,
			password: process.env.COOKIE_PASSWORD,
			cookieOptions: {
				secure: process.env.NODE_ENV === "production",
			},
		},
	)
