import { diff } from "fast-array-diff"

import { CURRENCY, CURRENCY_PAIR } from "@/constants"
import prisma from "@/prisma"
import { withApiSession } from "@/utils/middlewares"

export default withApiSession(async ({ req, res, user }) => {
	if (req.method === "PUT") {
		if (!user) {
			return res.status(401).send({
				message: "Cannot update user without an existing session",
			})
		}

		if (req.body.bookmarks) {
			const difference = diff(
				user.app.bookmarks,
				req.body.bookmarks.sort() as CURRENCY_PAIR[],
			)

			if (difference.added) {
				await prisma.bookmark.createMany({
					data: difference.added.map(currency_pair => ({
						user_id: user.id,
						currency_pair,
					})),
				})
			}

			if (difference.removed) {
				await prisma.bookmark.deleteMany({
					where: {
						user_id: user.id,
						currency_pair: {
							in: difference.removed,
						},
					},
				})
			}
		}

		if (req.body.balances) {
			await prisma.$transaction(
				Object.entries(req.body.balances as Partial<Record<CURRENCY, number>>).map(b =>
					prisma.balance.upsert({
						where: {
							user_id_currency: {
								user_id: user.id,
								currency: b[0],
							},
						},
						create: {
							user_id: user.id,
							currency: b[0],
							amount: b[1],
						},
						update: {
							amount: b[1],
						},
					}),
				),
			)
		}

		res.status(200).end()
	}
})
