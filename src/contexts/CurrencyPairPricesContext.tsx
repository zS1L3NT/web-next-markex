import { diff } from "fast-array-diff"
import { createContext, PropsWithChildren, useEffect, useMemo, useState } from "react"

import { OandaPrice } from "@/@types/oanda"
import { CURRENCY_PAIR, CURRENCY_PAIRS } from "@/constants"
import { usePrevious } from "@mantine/hooks"

const CHAR = ""

const CurrencyPairPricesContext = createContext<{
	prices: Record<CURRENCY_PAIR, typeof OandaPrice.infer | null>
	setCurrencyPairs: (currencyPairs: CURRENCY_PAIR[]) => void
}>({
	prices: {} as Record<CURRENCY_PAIR, typeof OandaPrice.infer | null>,
	setCurrencyPairs: (currencyPairs: CURRENCY_PAIR[]) => {}
})

export const CurrencyPairPricesProvider = ({ children }: PropsWithChildren<{}>) => {
	const socket = useMemo(
		() => new WebSocket("wss://dashboard.acuitytrading.com/signalRCommonHub?widget=Widgets"),
		[]
	)
	const [connected, setConnected] = useState(false)
	const [currencyPairs, setCurrencyPairs] = useState<CURRENCY_PAIR[]>([])
	const [prices, setPrices] = useState(
		Object.fromEntries(CURRENCY_PAIRS.map(cp => [cp, null])) as Record<
			CURRENCY_PAIR,
			typeof OandaPrice.infer | null
		>
	)
	const previousCurrencyPairs = usePrevious(currencyPairs)

	useEffect(() => {
		socket.onmessage = event => {
			const events = event.data.split(CHAR).slice(0, -1).map(JSON.parse)

			// Acknowledgement of connection
			if (events.length === 1 && JSON.stringify(events[0]) === "{}") {
				return setConnected(true)
			}

			// Acknowledgement of subscription or unsubscription
			if (events.length === 1 && events[0].type === 3) {
				return
			}

			// Acknowledgement of connection still being alive
			if (events.length === 1 && events[0].type === 6) {
				return
			}

			// Acknowledgement of disconnection
			if (events.length === 1 && events[0].type === 7) {
				return setConnected(false)
			}

			// Price data
			for (const event of events) {
				const result = OandaPrice(event.arguments?.[0])
				if (result.data) {
					setPrices(prices => ({
						...prices,
						[(result.data as any).Instrument as CURRENCY_PAIR]: result.data
					}))
				} else {
					console.error("Error parsing price from WebSocket:", result)
				}
			}
		}

		socket.onopen = () => {
			socket.send(`{"protocol":"json","version":1}${CHAR}`)
		}

		socket.onclose = () => {
			setConnected(false)
		}
	}, [])

	useEffect(() => {
		if (connected) {
			const interval = setInterval(() => {
				socket.send(`{"type":6}${CHAR}`)
			}, 15_000)

			return () => clearInterval(interval)
		}

		return
	}, [connected])

	useEffect(() => {
		if (connected) {
			const difference = diff(previousCurrencyPairs ?? [], currencyPairs)

			for (const added of difference.added) {
				socket.send(
					`{"arguments":["oanda_priceMessage","instrumentPrice_OAP_${added}"],"invocationId":"0","target":"subscribe","type":1}${CHAR}`
				)
			}

			for (const removed of difference.removed) {
				socket.send(
					`{"arguments":["oanda_priceMessage","instrumentPrice_OAP_${removed}"],"invocationId":"0","target":"unsubscribe","type":1}${CHAR}`
				)
			}
		}
	}, [connected, previousCurrencyPairs, currencyPairs])

	return (
		<CurrencyPairPricesContext.Provider
			value={{
				prices,
				setCurrencyPairs
			}}>
			{children}
		</CurrencyPairPricesContext.Provider>
	)
}

export default CurrencyPairPricesContext
