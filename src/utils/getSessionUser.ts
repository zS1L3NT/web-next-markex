import axios from "axios"

import { FidorUser } from "@/@types/fidor"
import { SessionUser } from "@/@types/iron-session"
import { COUNTRY_FLAGS, CURRENCY_PAIR } from "@/constants"
import prisma from "@/prisma"

const getSessionUser = async (accessToken: string): Promise<SessionUser> => {
	const { data: fidorUser } = await axios.get<typeof FidorUser.infer>(
		"https://api.tp.sandbox.fidorfzco.com/users/current",
		{
			headers: {
				Accept: "application/vnd.fidor.de; version=1,text/json",
				Authorization: `Bearer ${accessToken}`
			}
		}
	)

	const id = fidorUser.id!

	return {
		id,
		app: {
			bookmarks: await prisma.bookmark
				.findMany({ select: { currency_pair: true }, where: { user_id: id } })
				.then(bs => bs.map(b => b.currency_pair as CURRENCY_PAIR)),
			balances: await prisma.balance
				.findMany({ where: { user_id: id } })
				.then(
					bs =>
						Object.fromEntries(bs.map(b => [b.currency, b.amount])) as Record<
							keyof typeof COUNTRY_FLAGS,
							number | undefined
						>
				),
			transactions: await prisma.transaction.findMany({
				where: { user_id: id },
				orderBy: { created_at: "asc" }
			})
		},
		fidor: fidorUser
	}
}

export default getSessionUser
