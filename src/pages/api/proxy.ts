import axios, { AxiosError } from "axios"
import { IronSession } from "iron-session"
import { NextApiRequest, NextApiResponse } from "next"

import { withApiSession } from "@/utils/middlewares"

const getRefreshedAccessToken = async (
	session: IronSession
): Promise<{
	access_token: string
	refresh_token: string
}> => {
	return await axios
		.post(
			"https://apm.tp.sandbox.fidorfzco.com/oauth/token",
			{
				grant_type: "refresh_token",
				refresh_token: session.fidor?.refresh_token
			},
			{
				headers: {
					Authorization: `Basic ${Buffer.from(
						process.env.FIDOR_CLIENT_ID + ":" + process.env.FIDOR_CLIENT_SECRET,
						"utf-8"
					).toString("base64")}`
				}
			}
		)
		.then(res => res.data)
}

const handleRequest = async (req: NextApiRequest, res: NextApiResponse, session: IronSession) => {
	const { url, method, body, params, headers, auth } = req.body
	res.status(200).send(
		await axios({
			url,
			headers: {
				Accept: "application/vnd.fidor.de; version=1,text/json",
				...(auth ? { Authorization: "Bearer " + session.fidor?.access_token } : {}),
				...headers
			},
			method,
			params,
			data: body
		}).then(res => res.data)
	)
}

export default withApiSession(async ({ req, res, session, user }) => {
	if (req.method === "POST") {
		if (req.body.auth && !user) {
			return res.status(401).send({
				message: "Cannot access authorized route without an existing session"
			})
		}

		try {
			await handleRequest(req, res, session)
		} catch (e) {
			const error = <AxiosError>e
			if (req.body.auth && error.response?.status === 401) {
				const { access_token, refresh_token } = await getRefreshedAccessToken(session)
				session.fidor!.access_token = access_token
				session.fidor!.refresh_token = refresh_token
				await session.save()

				try {
					await handleRequest(req, res, session)
				} catch (e) {
					res.status(400).send(e)
				}
			} else {
				res.status(400).send(e)
			}
		}
	}
})
