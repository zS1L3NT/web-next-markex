import { CURRENCY } from "@/constants"
import prisma from "@/prisma"
import { withApiSession } from "@/utils/middlewares"

export default withApiSession(async ({ req, res, user }) => {
	if (req.method === "POST") {
		if (!user) {
			return res.status(401).send({
				message: "Cannot create transaction without an existing session",
			})
		}

		const transaction = await prisma.transaction.create({
			data: { ...req.body, user_id: user.id },
		})

		if (transaction.instrument?.includes("_")) {
			const [base, quote] = transaction.instrument.split("_") as [CURRENCY, CURRENCY]

			await prisma.$transaction([
				prisma.balance.upsert({
					where: {
						user_id_currency: {
							user_id: user.id,
							currency: transaction.type === "sell" ? quote : base,
						},
					},
					create: {
						user_id: user.id,
						currency: transaction.type === "sell" ? quote : base,
						amount:
							transaction.type === "sell"
								? transaction.amount * transaction.price
								: transaction.amount,
					},
					update: {
						amount: {
							increment:
								transaction.type === "sell"
									? transaction.amount * transaction.price
									: transaction.amount,
						},
					},
				}),
				prisma.balance.upsert({
					where: {
						user_id_currency: {
							user_id: user.id,
							currency: transaction.type === "sell" ? base : quote,
						},
					},
					create: {
						user_id: user.id,
						currency: transaction.type === "sell" ? base : quote,
						amount:
							transaction.type === "sell"
								? transaction.amount
								: transaction.amount * transaction.price,
					},
					update: {
						amount: {
							decrement:
								transaction.type === "sell"
									? transaction.amount
									: transaction.amount * transaction.price,
						},
					},
				}),
			])
		} else if (transaction.instrument) {
			await prisma.$transaction([
				prisma.balance.upsert({
					where: {
						user_id_currency: {
							user_id: user.id,
							currency: transaction.instrument, // SGD
						},
					},
					create: {
						user_id: user.id,
						currency: transaction.instrument,
						amount:
							transaction.type === "sell"
								? transaction.amount * transaction.price
								: 0, // Invalid case, just set to 0
					},
					update: {
						amount: {
							increment:
								transaction.type === "sell"
									? transaction.amount * transaction.price
									: -transaction.amount * transaction.price,
						},
					},
				}),
				prisma.asset.upsert({
					where: {
						user_id_instrument: {
							user_id: user.id,
							instrument: transaction.instrument,
						},
					},
					create: {
						user_id: user.id,
						instrument: transaction.instrument,
						quantity:
							transaction.type === "sell"
								? 0 // Invalid case, just set to 0
								: transaction.amount,
					},
					update: {
						quantity: {
							increment:
								transaction.type === "sell"
									? -transaction.amount
									: transaction.amount,
						},
					},
				}),
			])
		} else {
			await prisma.balance.upsert({
				where: {
					user_id_currency: {
						user_id: user.id,
						currency: "SGD",
					},
				},
				create: {
					user_id: user.id,
					currency: "SGD",
					amount: req.body.amount,
				},
				update: {
					amount: {
						increment: req.body.amount,
					},
				},
			})
		}

		res.status(200).end()
	}
})
