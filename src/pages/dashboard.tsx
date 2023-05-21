import Head from "next/head"

import { SessionUser } from "@/@types/iron-session"
import { useGetCandlesQuery } from "@/api/prices"
import { useGetInternalTransfersQuery } from "@/api/transactions"
import Shell from "@/components/Shell"
import { ProtectedRoute } from "@/utils/authenticators"

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
		<Shell user={user}>
			<Head>
				<title>Markex | Dashboard</title>
			</Head>
		</Shell>
	)
}

export const getServerSideProps = ProtectedRoute
