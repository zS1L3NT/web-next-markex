import { diff } from "fast-array-diff"

import { SessionUser } from "@/@types/iron-session"
import { CURRENCY_PAIR } from "@/constants"
import prisma from "@/prisma"
import withApiSession from "@/utils/withApiSession"

export default withApiSession(async ({ req, res, session }) => {
	if (req.method === "PUT") {
		if (!session.fidor_access_token || !session.fidor_refresh_token || !session.user) {
			return res.status(401).send({
				message: "Cannot update user without an existing session"
			})
		}

		if (req.body.bookmarks) {
			const difference = diff(
				session.user.app.bookmarks.sort(),
				req.body.bookmarks.sort() as CURRENCY_PAIR[]
			)

			if (difference.added) {
				await prisma.bookmark.createMany({
					data: difference.added.map(currency_pair => ({
						user_id: session.user!.id,
						currency_pair
					}))
				})
			}

			if (difference.removed) {
				await prisma.bookmark.deleteMany({
					where: {
						user_id: session.user!.id,
						currency_pair: { in: difference.removed }
					}
				})
			}

			session.user.app.bookmarks = req.body.bookmarks as SessionUser["app"]["bookmarks"]
		}

		if (req.body.balances) {
			await prisma.$transaction(
				Object.entries(req.body.balances as SessionUser["app"]["balances"]).map(b =>
					prisma.balance.upsert({
						where: { user_id_currency: { user_id: session.user!.id, currency: b[0] } },
						create: { user_id: session.user!.id, currency: b[0], amount: b[1]! },
						update: { amount: b[1] }
					})
				)
			)

			session.user.app.balances = req.body.balances as SessionUser["app"]["balances"]
		}

		await session.save()
		res.status(200).send(session.user.app)
	}
})
