import { useEffect, useState } from "react"

import { OandaPrice } from "@/@types/oanda"
import { useLazyGetPriceQuery } from "@/api/prices"
import { CURRENCY_PAIRS } from "@/constants"

const CHAR = ""

const useCurrencyPairLivePrices = (currencyPairs: readonly (typeof CURRENCY_PAIRS)[number][]) => {
	const [getPrice] = useLazyGetPriceQuery()

	const [prices, setPrices] = useState(
		{} as Record<(typeof CURRENCY_PAIRS)[number], typeof OandaPrice.infer>
	)

	useEffect(() => {
		let interval: NodeJS.Timeout
		const socket = new WebSocket(
			"wss://dashboard.acuitytrading.com/signalRCommonHub?widget=Widgets"
		)

		for (const currencyPair of currencyPairs) {
			getPrice({ currencyPair }).then(data =>
				setPrices(prices => ({ ...prices, [currencyPair]: data.data! }))
			)
		}

		socket.onmessage = event => {
			for (const subevent of event.data.split(CHAR).slice(0, -1)) {
				try {
					const data = JSON.parse(subevent)
					if (data.arguments?.[0]) {
						const result = OandaPrice(data.arguments[0])
						if (result.data) {
							setPrices(prices => ({
								...prices,
								[(result.data as any)
									.Instrument as (typeof CURRENCY_PAIRS)[number]]: result.data
							}))
						} else {
							console.error("Error parsing price from WebSocket:", result.problems)
						}
					}
				} catch (error) {
					console.error("Error parsing price from WebSocket:", { error, event })
				}
			}
		}

		socket.onopen = () => {
			socket.send(`{"protocol":"json","version":1}${CHAR}`)
			setTimeout(() => {
				for (const currencyPair of currencyPairs) {
					socket.send(
						`{"arguments":["oanda_priceMessage","instrumentPrice_OAP_${currencyPair}"],"invocationId":"0","target":"subscribe","type":1}${CHAR}`
					)
				}
			}, 250)

			interval = setInterval(() => {
				socket.send(`{"type":6}${CHAR}`)
			}, 15_000)
		}

		socket.onerror = (...args) => {
			console.error(`WebSocket Error:`, ...args)
		}

		return () => {
			if (interval) clearInterval(interval)
			socket.close()
		}
	}, [])

	return prices
}

export default useCurrencyPairLivePrices
