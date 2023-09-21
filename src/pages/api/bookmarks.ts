import { diff } from "fast-array-diff"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"

import prisma from "@/prisma"

import { authOptions } from "./auth/[...nextauth]"

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === "GET") {
		const session = await getServerSession(req, res, authOptions)

		if (!session?.user) {
			return res.status(401).send({
				message: "Cannot get bookmarks without an existing session",
			})
		}

		const bookmarks = (
			await prisma.bookmark.findMany({ where: { user_id: session.user.id } })
		).map(b => b.instrument)

		res.status(200).send(bookmarks)
	}
	if (req.method === "PUT") {
		const session = await getServerSession(req, res, authOptions)

		if (!session?.user) {
			return res.status(401).send({
				message: "Cannot update bookmarks without an existing session",
			})
		}

		const bookmarks = (
			await prisma.bookmark.findMany({ where: { user_id: session.user.id } })
		).map(b => b.instrument)
		const difference = diff(bookmarks, req.body.sort())

		if (difference.added) {
			await prisma.bookmark.createMany({
				data: difference.added.map(instrument => ({
					user_id: session.user.id,
					instrument,
				})),
			})
		}

		if (difference.removed) {
			await prisma.bookmark.deleteMany({
				where: {
					user_id: session.user.id,
					instrument: {
						in: difference.removed,
					},
				},
			})
		}

		res.status(200).end()
	}
}
