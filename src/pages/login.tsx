import axios from "axios"
import { getIronSession } from "iron-session/edge"
import { GetServerSideProps } from "next"

import { FidorUser } from "@/@types/fidor"
import Shell from "@/components/Shell"
import { Text } from "@mantine/core"

type Props = {
	error?: string
}

export default function Login({ error }: Props) {
	return (
		<Shell user={null}>
			<Text
				mt="2.5rem"
				align="center"
				fz="2rem"
				weight={700}>
				Login Error
			</Text>
			<Text
				mt="sm"
				align="center">
				{error}
			</Text>
		</Shell>
	)
}

const getTokens = async (
	code: string
): Promise<{ access_token: string; refresh_token: string }> => {
	return await axios
		.post(
			"https://apm.tp.sandbox.fidorfzco.com/oauth/token",
			{
				code,
				client_id: process.env.FIDOR_CLIENT_ID,
				redirect_uri: process.env.FIDOR_REDIRECT_URI,
				grant_type: "authorization_code"
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

const getFidorUser = async (accessToken: string): Promise<FidorUser> => {
	return await axios
		.get<FidorUser>("https://api.tp.sandbox.fidorfzco.com/users/current", {
			headers: {
				Accept: "application/vnd.fidor.de; version=1,text/json",
				Authorization: `Bearer ${accessToken}`
			}
		})
		.then(res => res.data)
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
	const { code, error } = Object.fromEntries(new URLSearchParams(req.url?.substring(7) ?? ""))

	if (code) {
		try {
			const { access_token, refresh_token } = await getTokens(code)
			const user = await getFidorUser(access_token)
			const session = await getIronSession(req, res, {
				cookieName: process.env.COOKIE_NAME,
				password: process.env.COOKIE_PASSWORD,
				cookieOptions: {
					secure: process.env.NODE_ENV === "production"
				}
			})

			session.fidor = { access_token, refresh_token, user }
			await session.save()

			return {
				redirect: {
					destination: "/dashboard"
				},
				props: {}
			}
		} catch (err) {
			console.error(err)

			return {
				redirect: {
					destination: `/login?error=${(err as Error).message}`
				},
				props: {}
			}
		}
	} else if (error) {
		return {
			props: {
				error
			}
		}
	} else {
		const query = new URLSearchParams({
			response_type: "code",
			client_id: process.env.FIDOR_CLIENT_ID,
			redirect_uri: process.env.FIDOR_REDIRECT_URI,
			state: "123"
		})

		return {
			redirect: {
				destination: `https://apm.tp.sandbox.fidorfzco.com/oauth/authorize?${query.toString()}`
			},
			props: {}
		}
	}
}
