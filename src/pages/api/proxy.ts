import axios, { AxiosError } from "axios"

import { ApiError } from "@/utils/axiosBaseQuery"
import withApiSession from "@/utils/withApiSession"

export default withApiSession(async ({ req, res, session }) => {
	if (req.method === "POST") {
		const { url, method, body, params, headers, auth } = req.body

		if (auth && (!session.fidor_access_token || !session.user)) {
			return res.status(401).send({
				message: "Cannot access authorized route without an existing session"
			})
		}

		try {
			const result = await axios({
				url,
				headers: {
					Accept: "application/vnd.fidor.de; version=1,text/json",
					...(auth ? { Authorization: "Bearer " + session.fidor_access_token } : {}),
					...headers
				},
				method,
				params,
				data: body
			})

			res.status(200).send(result.data)
		} catch (e) {
			const error = <AxiosError>e
			console.error(error)

			const result = ApiError(error.response?.data)
			res.status(400).send({
				message: result.data?.message ?? error.message,
				key: result.data?.key ?? [],
				code: result.data?.code ?? error.code ? +error.code! : 500,
				errors: result.data?.errors ?? []
			})
		}
	}
})
