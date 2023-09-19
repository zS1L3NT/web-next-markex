import { useRouter } from "next/router"
import { createContext, PropsWithChildren, useEffect, useState } from "react"
import useWebSocket from "react-use-websocket"

import { AlpacaLiveQuote, AlpacaLiveTrade } from "@/@types/alpaca"

export const StockLivePricesContext = createContext<{
	price: number | undefined
	quote: { bidPrice: number; askPrice: number } | undefined
}>({
	price: undefined,
	quote: undefined,
})

export const StockLivePricesProvider = ({ children }: PropsWithChildren) => {
	const router = useRouter()
	const {
		route,
		query: { symbol },
	} = router

	const [connected, setConnected] = useState(false)
	const [price, setPrice] = useState<number | undefined>(undefined)
	const [quote, setQuote] = useState<{ bidPrice: number; askPrice: number } | undefined>(
		undefined,
	)

	// WebSocket
	const { sendMessage: sendAlpaca } = useWebSocket("wss://stream.data.alpaca.markets/v2/iex", {
		onOpen: () => {
			console.log("Socket opened")
		},
		onMessage: event => {
			const data: any[] = JSON.parse(event.data)
			for (let i = 0; i < data.length; i++) {
				if ("msg" in data[i] && data[i].msg === "connected") {
					sendAlpaca(
						JSON.stringify({
							action: "auth",
							key: process.env.NEXT_PUBLIC_APCA_API_KEY_ID,
							secret: process.env.NEXT_PUBLIC_APCA_API_SECRET_KEY,
						}),
					)
				} else if ("msg" in data[i] && data[i].msg === "authenticated") {
					console.log("Authenticated")
					setConnected(true)
				} else if ("T" in data[i] && data[i].T === "t") {
					const { data: trade, problems } = AlpacaLiveTrade(data[i])
					if (problems && problems.length > 0) {
						console.error("Error parsing trade...", problems)
						return
					}
					if (trade) {
						const price = trade.p
						if (trade.S === symbol) setPrice(price)
					}
				} else if ("T" in data[i] && data[i].T === "q") {
					const { data: quote, problems } = AlpacaLiveQuote(data[i])
					if (problems && problems.length > 0) {
						console.error("Error parsing quote...", problems)
						return
					}
					if (quote) {
						const bidPrice = quote.bp
						const askPrice = quote.ap
						setQuote({ askPrice, bidPrice })
					}
				}
			}
		},
	})
	useEffect(() => {
		if (connected) {
			sendAlpaca(
				JSON.stringify({
					action: "unsubscribe",
					trades: ["*"],
					quotes: ["*"],
				}),
			)
		}

		if (typeof symbol !== "string") {
			setPrice(undefined)
			setQuote(undefined)
			return
		}

		// Subscribe to quotes and trades
		sendAlpaca(
			JSON.stringify({
				action: "subscribe",
				trades: [symbol],
				quotes: [symbol],
			}),
		)
	}, [connected, route, symbol, sendAlpaca])

	return (
		<StockLivePricesContext.Provider value={{ quote, price }}>
			{children}
		</StockLivePricesContext.Provider>
	)
}
