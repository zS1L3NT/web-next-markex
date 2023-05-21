import { withIronSessionSsr } from "iron-session/next"
import Head from "next/head"

import { SessionUser } from "@/@types/iron-session"
import { useGetCandlesQuery } from "@/api/prices"
import { useGetInternalTransfersQuery } from "@/api/transactions"

type Props = {
	user: SessionUser
}

export default function Dashboard({ user }: Props) {
	const { data: transactions, error: transactionsError } = useGetInternalTransfersQuery()
	const { data: candles, error: candlesError } = useGetCandlesQuery({
		currencyPair: "USD_MXN",
		period: "H1"
	})

	return (
		<>
			<Head>
				<title>Markex | Dashboard</title>
			</Head>
		</>
	)
}

export const getServerSideProps = withIronSessionSsr<Props>(
	async function handle({ req, res }) {
		const user = req.session.user
		
		if (user) {
			return {
				props: {
					user
				}
			}
		} else {
			return {
				notFound: true
			}
		}
	},
	{
		cookieName: process.env.COOKIE_NAME,
		password: process.env.COOKIE_PASSWORD,
		cookieOptions: {
			secure: process.env.NODE_ENV === "production"
		}
	}
)
