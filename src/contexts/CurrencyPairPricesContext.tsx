import { createContext, PropsWithChildren, useCallback, useEffect, useState } from "react"

import { notifications } from "@mantine/notifications"
import { IconExclamationMark, IconX } from "@tabler/icons-react"

import { OandaPrice } from "@/@types/oanda"
import { useLazyGetOandaPriceQuery } from "@/api/prices"
import { CURRENCY_PAIR, CURRENCY_PAIRS } from "@/constants"

const CHAR = ""

const CurrencyPairPricesContext = createContext<{
	prices: Partial<Record<CURRENCY_PAIR, OandaPrice | null>>
}>({
	prices: {} as Partial<Record<CURRENCY_PAIR, OandaPrice | null>>,
})

export const CurrencyPairPricesProvider = ({ children }: PropsWithChildren) => {
	const [getOandaPrice] = useLazyGetOandaPriceQuery()

	const [socket, setSocket] = useState<WebSocket | null>(null)
	const [connected, setConnected] = useState(false)
	const [prices, setPrices] = useState<Partial<Record<CURRENCY_PAIR, OandaPrice | null>>>({})

	useEffect(() => {
		if (connected) {
			let events = ""
			const interval = setInterval(() => socket?.send(`{"type":6}${CHAR}`), 15_000)

			for (const currencyPair of CURRENCY_PAIRS) {
				getOandaPrice({ currencyPair }).then(price => {
					setPrices(prices => ({
						...prices,
						[currencyPair]: price.data ?? null,
					}))
				})

				events +=
					JSON.stringify({
						arguments: [
							"oanda_priceMessage",
							{
								groupName: `instrumentPrice_OAP_${currencyPair}`,
								ApiKey: "4b12e6bb-7ecd-49f7-9bbc-2e03644ce41f",
							},
						],
						invocationId: "0",
						target: "subscribe",
						type: 1,
					}) + CHAR
			}

			if (events) {
				socket?.send(events)
			}

			return () => clearInterval(interval)
		}

		return
	}, [getOandaPrice, socket, connected])

	const connect = useCallback(() => {
		const socket = new WebSocket(
			"wss://dashboard.acuitytrading.com/signalRCommonHub?widget=Widgets",
		)

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

			// Acknowledgement of subscriptions without telling me who I'm subscribed to
			if (events.every(e => e.type === 3)) {
				return
			}

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
		}

		socket.onopen = e => {
			console.log("WebSocket Opened", e)
			setSocket(socket)
			socket.send(`{"protocol":"json","version":1}${CHAR}`)
		}

		socket.onclose = e => {
			console.log("WebSocket Closed", e)
			setSocket(null)
			setTimeout(connect, 1000)
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
	}, [])

	useEffect(() => {
		try {
			connect()
		} catch (e) {
			console.warn("WebSocket connection failed", e)
			notifications.show({
				withCloseButton: true,
				autoClose: 10000,
				title: "WebSocket connection failed",
				message: "The WebSocket threw an error trying to connect",
				color: "red",
				icon: <IconX />,
			})
		}
	}, [connect])

	return (
		<CurrencyPairPricesContext.Provider value={{ prices }}>
			{children}
		</CurrencyPairPricesContext.Provider>
	)
}

export default CurrencyPairPricesContext
