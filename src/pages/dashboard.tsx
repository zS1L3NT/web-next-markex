import Head from "next/head"

import { useGetCandlesQuery } from "@/api/prices"
import { useGetInternalTransfersQuery } from "@/api/transactions"
import useOnlyAuthenticated from "@/hooks/useOnlyAuthenticated"

export default function Dashboard() {
	const { token } = useOnlyAuthenticated()

	const { data: transactions, error: transactionsError } = useGetInternalTransfersQuery({ token })
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
