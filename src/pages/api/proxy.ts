import axios, { AxiosError } from "axios"
import { NextApiRequest, NextApiResponse } from "next"

import { ApiError } from "@/utils/axiosBaseQuery"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		const { url, method, body, params, headers, token } = req.body

		try {
			const result = await axios({
				url,
				headers: {
					Accept: "application/vnd.fidor.de; version=1,text/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
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
}
