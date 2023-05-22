import axios from "axios"
import { getIronSession } from "iron-session/edge"
import { GetServerSideProps } from "next"

import { FidorUser } from "@/@types/fidor"
import { SessionUser } from "@/@types/iron-session"
import { COUNTRY_FLAGS, CURRENCY_PAIR } from "@/constants"
import prisma from "@/prisma"

type Props = {
	error?: string
}

export default function Login({ error }: Props) {
	return <>Error: {error ?? ""}</>
}

const getTokens = async (
	code: string
): Promise<{ access_token: string; refresh_token: string }> => {
	return await axios
		.post(
			"https://apm.tp.sandbox.fidorfzco.com/oauth/token",
			{
				code,
				client_id: process.env.NEXT_PUBLIC_FIDOR_CLIENT_ID,
				redirect_uri: process.env.NEXT_PUBLIC_FIDOR_REDIRECT_URI,
				grant_type: "authorization_code"
			},
			{
				headers: {
					Authorization: `Basic ${Buffer.from(
						process.env.NEXT_PUBLIC_FIDOR_CLIENT_ID +
							":" +
							process.env.NEXT_PUBLIC_FIDOR_CLIENT_SECRET,
						"utf-8"
					).toString("base64")}`
				}
			}
		)
		.then(res => res.data)
}

const getSessionUser = async (accessToken: string): Promise<SessionUser | undefined> => {
	try {
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
	} catch (error) {
		console.log("Error fetching session user:", error)
		return undefined
	}
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
	const { code, error } = Object.fromEntries(new URLSearchParams(req.url?.substring(7) ?? ""))

	if (code) {
		try {
			const { access_token, refresh_token } = await getTokens(code)
			const user = await getSessionUser(access_token)
			const session = await getIronSession(req, res, {
				cookieName: process.env.COOKIE_NAME,
				password: process.env.COOKIE_PASSWORD,
				cookieOptions: {
					secure: process.env.NODE_ENV === "production"
				}
			})

			session.fidor_access_token = access_token
			session.fidor_refresh_token = refresh_token
			session.user = user
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
			client_id: process.env.NEXT_PUBLIC_FIDOR_CLIENT_ID,
			redirect_uri: process.env.NEXT_PUBLIC_FIDOR_REDIRECT_URI,
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
