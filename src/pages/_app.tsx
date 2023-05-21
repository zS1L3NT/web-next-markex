import { AppProps } from "next/app"
import { Provider as ReduxProvider } from "react-redux"

import { CurrencyPairPricesProvider } from "@/contexts/CurrencyPairPricesContext"
import store from "@/store"
import { MantineProvider } from "@mantine/core"

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ReduxProvider store={store}>
			<MantineProvider
				withGlobalStyles
				withNormalizeCSS
				theme={{ colorScheme: "dark" }}>
				<CurrencyPairPricesProvider>
					<Component {...pageProps} />
				</CurrencyPairPricesProvider>
			</MantineProvider>
		</ReduxProvider>
	)
}
