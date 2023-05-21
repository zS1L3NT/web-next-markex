import { AppProps } from "next/app"
import { Provider as ReduxProvider } from "react-redux"

import Header from "@/components/Header"
import Navbar from "@/components/Navbar"
import { CurrencyPairPricesProvider } from "@/contexts/CurrencyPairPricesContext"
import store from "@/store"
import { AppShell, MantineProvider } from "@mantine/core"

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ReduxProvider store={store}>
			<MantineProvider
				withGlobalStyles
				withNormalizeCSS
				theme={{ colorScheme: "dark" }}>
				<CurrencyPairPricesProvider>
					<AppShell
						sx={{ background: "rgb(20, 21, 23)", overflowX: "hidden" }}
						navbar={<Navbar />}
						header={<Header />}
						layout="alt">
						<Component {...pageProps} />
					</AppShell>
				</CurrencyPairPricesProvider>
			</MantineProvider>
		</ReduxProvider>
	)
}
