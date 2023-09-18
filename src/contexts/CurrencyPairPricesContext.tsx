import { diff } from "fast-array-diff"
import { createContext, PropsWithChildren, useEffect, useMemo, useState } from "react"

import { notifications } from "@mantine/notifications"
import { IconExclamationMark, IconX } from "@tabler/icons-react"

import { OandaPrice } from "@/@types/oanda"
import { useLazyGetOandaPriceQuery } from "@/api/prices"
import { CURRENCY_PAIR } from "@/constants"

const CHAR = ""

const CurrencyPairPricesContext = createContext<{
	prices: Partial<Record<CURRENCY_PAIR, OandaPrice | null>>
	setCurrencyPairs: (currencyPairs: CURRENCY_PAIR[]) => void
}>({
	prices: {} as Partial<Record<CURRENCY_PAIR, OandaPrice | null>>,
	setCurrencyPairs: () => {},
})

export const CurrencyPairPricesProvider = ({ children }: PropsWithChildren) => {
	const [getOandaPrice] = useLazyGetOandaPriceQuery()

	const socket = useMemo(
		() => new WebSocket("wss://dashboard.acuitytrading.com/signalRCommonHub?widget=Widgets"),
		[],
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
							[(result.data as any).Instrument as CURRENCY_PAIR]: result.data,
						}))
					} else {
						console.error("Error parsing price from WebSocket:", result)
						notifications.show({
							withCloseButton: true,
							autoClose: 10000,
							title: "WebSocket Data Error",
							message: (
								<>
									Error parsing price from WebSocket
									<br />
									{result.problems.length + " "}problems found
								</>
							),
							color: "red",
							icon: <IconX />,
						})
					}
				}

				return
			}

			//			// Acknowledgement of subscription or unsubscription
			//			if (events.every(e => e.type === 3)) {
			//				const added = events
			//					.filter(e => e.target === "subscribe")
			//					.map(e => e.arguments[1].slice("instrumentPrice_OAP_".length))
			//					.sort()
			//				const removed = events
			//					.filter(e => e.target === "unsubscribe")
			//					.map(e => e.arguments[1].slice("instrumentPrice_OAP_".length))
			//					.sort()
			//
			//				if (pendingCurrencyPairs) {
			//					const difference = diff(currencyPairs, pendingCurrencyPairs)
			//					if (
			//						JSON.stringify(added) === JSON.stringify(difference.added.sort()) &&
			//						JSON.stringify(removed) === JSON.stringify(difference.removed.sort())
			//					) {
			//						setPendingCurrencyPairs(null)
			//						setCurrencyPairs(pendingCurrencyPairs)
			//					} else {
			//						console.warn("Unequal lists of currency pairs", {
			//							currencyPairs,
			//							pendingCurrencyPairs,
			//							events,
			//						})
			//						notifications.show({
			//							withCloseButton: true,
			//							autoClose: 10000,
			//							title: "WebSocket Subscription Warning",
			//							message: "Unequal lists of currency pairs",
			//							color: "orange",
			//							icon: <IconExclamationMark />,
			//						})
			//					}
			//				} else {
			//					console.warn("No pending currency pairs but received subscription events", {
			//						events,
			//					})
			//					notifications.show({
			//						withCloseButton: true,
			//						autoClose: 10000,
			//						title: "WebSocket Subscription Warning",
			//						message: "No pending currency pairs but received subscription events",
			//						color: "orange",
			//						icon: <IconExclamationMark />,
			//					})
			//				}
			//
			//				return
			//			}

			// Acknowledgement of connection still being alive
			if (events.length === 1 && events[0].type === 6) {
				return
			}

			// Acknowledgement of disconnection
			if (events.length === 1 && events[0].type === 7) {
				notifications.show({
					withCloseButton: true,
					autoClose: 10000,
					title: "WebSocket Closed Warning",
					message: events[0].error,
					color: "orange",
					icon: <IconExclamationMark />,
				})
				return setConnected(false)
			}

			console.warn("Unhandled WebSocket event", { events })
			notifications.show({
				withCloseButton: true,
				autoClose: 10000,
				title: "WebSocket Error",
				message: "Unhandled WebSocket event",
				color: "orange",
				icon: <IconExclamationMark />,
			})
		}

		socket.onopen = () => {
			socket.send(`{"protocol":"json","version":1}${CHAR}`)
		}

		socket.onerror = e => {
			console.error("WebSocket Error", e)
			notifications.show({
				withCloseButton: true,
				autoClose: 10000,
				title: "WebSocket Error",
				message: "The WebSocket sent an error event",
				color: "red",
				icon: <IconX />,
			})
		}

		socket.onclose = () => {
			setConnected(false)
		}
	}, [socket, currencyPairs, pendingCurrencyPairs])

	useEffect(() => {
		if (connected) {
			for (const currencyPair of currencyPairs) {
				getOandaPrice({ currencyPair }).then(price => {
					setPrices(prices => ({
						...prices,
						[currencyPair]: price.data ?? null,
					}))
				})
			}
		}
	}, [getOandaPrice, socket, connected, currencyPairs])

	useEffect(() => {
		if (connected) {
			const interval = setInterval(() => {
				socket.send(`{"type":6}${CHAR}`)
			}, 15_000)

			return () => clearInterval(interval)
		}

		return
	}, [socket, connected])

	useEffect(() => {
		if (connected && pendingCurrencyPairs) {
			const difference = diff(currencyPairs, pendingCurrencyPairs)
			let events = ""

			for (const added of difference.added) {
				events +=
					JSON.stringify({
						arguments: [
							"oanda_priceMessage",
							{
								groupName: `instrumentPrice_OAP_${added}`,
								ApiKey: "4b12e6bb-7ecd-49f7-9bbc-2e03644ce41f",
							},
						],
						invocationId: "0",
						target: "subscribe",
						type: 1,
					}) + CHAR
			}

			for (const removed of difference.removed) {
				events +=
					JSON.stringify({
						arguments: [
							"oanda_priceMessage",
							{
								groupName: `instrumentPrice_OAP_${removed}`,
								ApiKey: "4b12e6bb-7ecd-49f7-9bbc-2e03644ce41f",
							},
						],
						invocationId: "0",
						target: "unsubscribe",
						type: 1,
					}) + CHAR
			}

			if (events) {
				socket.send(events)
			}
		}
	}, [socket, connected, currencyPairs, pendingCurrencyPairs])

	return (
		<CurrencyPairPricesContext.Provider
			value={{
				prices,
				setCurrencyPairs: setPendingCurrencyPairs,
			}}>
			{children}
		</CurrencyPairPricesContext.Provider>
	)
}

export default CurrencyPairPricesContext
