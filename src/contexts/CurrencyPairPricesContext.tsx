import { diff } from "fast-array-diff"
import { createContext, PropsWithChildren, useEffect, useMemo, useState } from "react"

import { OandaPrice } from "@/@types/oanda"
import { useLazyGetOandaPriceQuery } from "@/api/prices"
import { CURRENCY_PAIR } from "@/constants"

const CHAR = ""

const CurrencyPairPricesContext = createContext<{
	prices: Partial<Record<CURRENCY_PAIR, OandaPrice | null>>
	setCurrencyPairs: (currencyPairs: CURRENCY_PAIR[]) => void
}>({
	prices: {} as Partial<Record<CURRENCY_PAIR, OandaPrice | null>>,
	setCurrencyPairs: (currencyPairs: CURRENCY_PAIR[]) => {}
})

export const CurrencyPairPricesProvider = ({ children }: PropsWithChildren<{}>) => {
	const [getOandaPrice] = useLazyGetOandaPriceQuery()

	const socket = useMemo(
		() => new WebSocket("wss://dashboard.acuitytrading.com/signalRCommonHub?widget=Widgets"),
		[]
	)
	const [connected, setConnected] = useState(false)
	const [pendingCurrencyPairs, setPendingCurrencyPairs] = useState<CURRENCY_PAIR[] | null>(null)
	const [currencyPairs, setCurrencyPairs] = useState<CURRENCY_PAIR[]>([])
	const [prices, setPrices] = useState<Partial<Record<CURRENCY_PAIR, OandaPrice | null>>>({})

	useEffect(() => {
		socket.onmessage = event => {
			const events = event.data.split(CHAR).slice(0, -1).map(JSON.parse) as any[]

			// Acknowledgement of connection
			if (events.length === 1 && JSON.stringify(events[0]) === "{}") {
				return setConnected(true)
			}

			// Price data
			if (events.every(e => e.type === 1)) {
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

				return
			}

			// Acknowledgement of subscription or unsubscription
			if (events.every(e => e.type === 3)) {
				const added = events
					.filter(e => e.target === "subscribe")
					.map(e => e.arguments[1].slice("instrumentPrice_OAP_".length))
					.sort()
				const removed = events
					.filter(e => e.target === "unsubscribe")
					.map(e => e.arguments[1].slice("instrumentPrice_OAP_".length))
					.sort()

				if (pendingCurrencyPairs) {
					const difference = diff(currencyPairs, pendingCurrencyPairs!)
					if (
						JSON.stringify(added) === JSON.stringify(difference.added.sort()) &&
						JSON.stringify(removed) === JSON.stringify(difference.removed.sort())
					) {
						setPendingCurrencyPairs(null)
						setCurrencyPairs(pendingCurrencyPairs)
					} else {
						console.warn("Uneqal lists of currency pairs", {
							currencyPairs,
							pendingCurrencyPairs,
							events
						})
					}
				} else {
					console.error("No pending currency pairs but received subscription events", {
						events
					})
				}

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

			console.warn("Unhandled WebSocket event", { events })
		}

		socket.onopen = () => {
			socket.send(`{"protocol":"json","version":1}${CHAR}`)
		}

		socket.onclose = () => {
			setConnected(false)
		}
	}, [currencyPairs, pendingCurrencyPairs])

	useEffect(() => {
		if (connected) {
			for (const currencyPair of currencyPairs) {
				getOandaPrice({ currencyPair }).then(price => {
					setPrices(prices => ({
						...prices,
						[currencyPair]: price.data ?? null
					}))
				})
			}
		}
	}, [connected, currencyPairs])

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
		if (connected && pendingCurrencyPairs) {
			const difference = diff(currencyPairs, pendingCurrencyPairs)
			let events = ""

			for (const added of difference.added) {
				events += `{"arguments":["oanda_priceMessage","instrumentPrice_OAP_${added}"],"target":"subscribe","type":1}${CHAR}`
			}

			for (const removed of difference.removed) {
				events += `{"arguments":["oanda_priceMessage","instrumentPrice_OAP_${removed}"],"target":"unsubscribe","type":1}${CHAR}`
			}

			if (events) {
				socket.send(events)
			}
		}
	}, [connected, currencyPairs, pendingCurrencyPairs])

	return (
		<CurrencyPairPricesContext.Provider
			value={{
				prices,
				setCurrencyPairs: setPendingCurrencyPairs
			}}>
			{children}
		</CurrencyPairPricesContext.Provider>
	)
}

export default CurrencyPairPricesContext
