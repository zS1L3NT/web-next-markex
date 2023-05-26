import { AppProps } from "next/app"
import { Provider as ReduxProvider } from "react-redux"

import { CurrencyPairPricesProvider } from "@/contexts/CurrencyPairPricesContext"
import { NavigatorProvider } from "@/contexts/NavigatorContext"
import store from "@/store"
import { MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ReduxProvider store={store}>
			<CurrencyPairPricesProvider>
				<NavigatorProvider>
					<MantineProvider
						withGlobalStyles
						withNormalizeCSS
						theme={{ colorScheme: "dark" }}>
						<Notifications />
						<Component {...pageProps} />
					</MantineProvider>
				</NavigatorProvider>
			</CurrencyPairPricesProvider>
		</ReduxProvider>
	)
}
