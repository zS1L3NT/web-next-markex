import axios from "axios"
import { setCookie } from "cookies-next"
import { GetServerSideProps } from "next"

type Props = {
	error?: string
}

export default function Login({ error }: Props) {
	return <>Error: {error ?? ""}</>
}

export const getServerSideProps: GetServerSideProps<Props> = async context => {
	const { code, error } = Object.fromEntries(
		new URLSearchParams(context.req.url?.substring(7) ?? "")
	)

	if (code) {
		try {
			const result = await axios.post(
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

			setCookie("token", result.data.access_token, context)

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
