import { SessionUser } from "@/@types/iron-session"
import { CURRENCY } from "@/constants"
import prisma from "@/prisma"
import withApiSession from "@/utils/withApiSession"

export default withApiSession(async ({ req, res, session }) => {
	if (req.method === "POST") {
		if (!session.fidor_access_token || !session.fidor_refresh_token || !session.user) {
			return res.status(401).send({
				message: "Cannot create transaction without an existing session"
			})
		}

		const transaction = await prisma.transaction.create({
			data: {
				...req.body,
				user_id: session.user.id
			}
		})

		session.user.app.transactions.push(transaction)
		await session.save()

		if (transaction.currency_pair) {
			const [base, quote] = transaction.currency_pair.split("_") as [CURRENCY, CURRENCY]

			await prisma.$transaction([
				prisma.balance.upsert({
					where: {
						user_id_currency: {
							user_id: session.user.id,
							currency: transaction.type === "sell" ? quote : base
						}
					},
					create: {
						user_id: session.user.id,
						currency: transaction.type === "sell" ? quote : base,
						amount:
							transaction.type === "sell"
								? transaction.amount * transaction.price
								: transaction.amount
					},
					update: {
						amount: {
							increment:
								transaction.type === "sell"
									? transaction.amount * transaction.price
									: transaction.amount
						}
					}
				}),
				prisma.balance.upsert({
					where: {
						user_id_currency: {
							user_id: session.user.id,
							currency: transaction.type === "sell" ? base : quote
						}
					},
					create: {
						user_id: session.user.id,
						currency: transaction.type === "sell" ? base : quote,
						amount:
							transaction.type === "sell"
								? transaction.amount
								: transaction.amount * transaction.price
					},
					update: {
						amount: {
							decrement:
								transaction.type === "sell"
									? transaction.amount
									: transaction.amount * transaction.price
						}
					}
				})
			])
		} else {
			await prisma.balance.upsert({
				where: {
					user_id_currency: {
						user_id: session.user.id,
						currency: "SGD"
					}
				},
				create: {
					user_id: session.user.id,
					currency: "SGD",
					amount: req.body.amount
				},
				update: {
					amount: {
						increment: req.body.amount
					}
				}
			})
		}

		session.user.app.balances = await prisma.balance
			.findMany({ where: { user_id: session.user.id } })
			.then(
				bs =>
					Object.fromEntries(
						bs.map(b => [b.currency, b.amount])
					) as SessionUser["app"]["balances"]
			)
		await session.save()

		res.status(200).send(transaction)
	}
})
