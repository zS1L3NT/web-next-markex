import { useEffect } from "react"

import { useGetCandlesQuery } from "@/api/prices"
import { useGetInternalTransfersQuery } from "@/api/transfers"
import useOnlyAuthenticated from "@/hooks/useOnlyAuthenticated"

export default function Dashboard() {
	const { token } = useOnlyAuthenticated()

	const { data: transactions, error: transactionsError } = useGetInternalTransfersQuery({ token })
	const { data: candles, error: candlesError } = useGetCandlesQuery({
		currencies: "USD_MXN",
		period: "H1"
	})

	useEffect(() => {
		console.log(transactions)
	}, [transactions])

	useEffect(() => {
		console.log(candles)
	}, [candles])

	return <></>
}
