import { getCookie } from "cookies-next"
import { GetServerSidePropsContext } from "next"
import { AppProps } from "next/app"
import { Provider as ReduxProvider } from "react-redux"

import { MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"

import { CurrencyPairPricesProvider } from "@/contexts/CurrencyPairPricesContext"
import { NavigatorProvider } from "@/contexts/NavigatorContext"
import { StockLivePricesProvider } from "@/contexts/StockLivePricesContext"
import store from "@/store"

export type BrowserSize = {
	isBelowXs: boolean
	isAboveLg: boolean
}

export default function App({
	Component,
	pageProps,
	size,
}: AppProps & { size: BrowserSize | null }) {
	return (
		<ReduxProvider store={store}>
			<StockLivePricesProvider>
				<CurrencyPairPricesProvider>
					<NavigatorProvider size={size}>
						<MantineProvider
							withGlobalStyles
							withNormalizeCSS
							theme={{ colorScheme: "dark" }}>
							<Notifications />
							<Component {...pageProps} />
						</MantineProvider>
					</NavigatorProvider>
				</CurrencyPairPricesProvider>
			</StockLivePricesProvider>
		</ReduxProvider>
	)
}

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
	size: getCookie("browser-size", ctx)
		? JSON.parse(getCookie("browser-size", ctx) as string)
		: null,
})
