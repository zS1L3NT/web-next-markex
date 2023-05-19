import { useEffect, useState } from "react"

import { OandaLivePrice } from "@/@types/oanda"
import { CURRENCY_PAIRS } from "@/constants"

const useCurrencyPairLivePrice = (currencyPair: (typeof CURRENCY_PAIRS)[number]) => {
	const [price, setPrice] = useState<typeof OandaLivePrice.infer | null>(null)

	useEffect(() => {
		let interval: NodeJS.Timeout
		const socket = new WebSocket(
			"wss://dashboard.acuitytrading.com/signalRCommonHub?widget=Widgets"
		)

		socket.onmessage = event => {
			const data = JSON.parse(event.data.substring(0, event.data.length - 1))
			if (data.arguments?.[0]) {
				const result = OandaLivePrice(data.arguments[0])
				if (result.data) {
					setPrice(result.data)
				} else {
					console.error("Error parsing price from WebSocket:", result.problems)
				}
			}
		}

		socket.onopen = () => {
			socket.send(`{"protocol":"json","version":1}`)
			setTimeout(() => {
				socket.send(
					`{"arguments":["oanda_priceMessage","instrumentPrice_OAP_${currencyPair}"],"invocationId":"0","target":"subscribe","type":1}`
				)
			}, 250)

			interval = setInterval(() => {
				socket.send(`{"type":6}`)
			}, 15_000)
		}

		socket.onerror = (...args) => {
			console.error("WebSocket Error:", ...args)
		}

		return () => {
			if (interval) clearInterval(interval)
			socket.close()
		}
	}, [currencyPair])

	return price
}

export default useCurrencyPairLivePrice
