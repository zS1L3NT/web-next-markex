import axios from "axios"
import { getIronSession } from "iron-session/edge"
import { GetServerSideProps } from "next"

import { FidorUser } from "@/@types/fidor"

type Props = {
	error?: string
}

export default function Login({ error }: Props) {
	return <>Error: {error ?? ""}</>
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
	const { code, error } = Object.fromEntries(new URLSearchParams(req.url?.substring(7) ?? ""))

	if (code) {
		try {
			const {
				data: { access_token }
			} = await axios.post(
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

			const { data: fidorUser } = await axios.get<typeof FidorUser.infer>(
				"https://api.tp.sandbox.fidorfzco.com/users/current",
				{
					headers: {
						Accept: "application/vnd.fidor.de; version=1,text/json",
						Authorization: `Bearer ${access_token}`
					}
				}
			)

			const session = await getIronSession(req, res, {
				cookieName: process.env.COOKIE_NAME,
				password: process.env.COOKIE_PASSWORD,
				cookieOptions: {
					secure: process.env.NODE_ENV === "production"
				}
			})

			session.fidor_access_token = access_token
			session.user = {
				id: fidorUser.id!,
				app: {
					bookmarks: [],
					balances: {}
				},
				fidor: fidorUser
			}
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
