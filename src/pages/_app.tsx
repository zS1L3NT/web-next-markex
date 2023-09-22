import { getCookie } from "cookies-next"
import { GetServerSidePropsContext } from "next"
import { AppProps } from "next/app"
import dynamic from "next/dynamic"
import Head from "next/head"
import { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import { Provider as ReduxProvider } from "react-redux"

import { MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"

import { CurrencyPairPricesProvider } from "@/contexts/CurrencyPairPricesContext"
import { MediaQueryProvider } from "@/contexts/MediaQueryContext"
import { StockLivePricesProvider } from "@/contexts/StockLivePricesContext"
import store from "@/store"

const PWAUpdaterModal = dynamic(() => import("../components/Modals/PWAUpdaterModal"), {
	ssr: false,
})

export default function App({
	Component,
	pageProps,
	session,
	width,
}: AppProps & {
	session: Session
	width: number
}) {
	return (
		<>
			<Head>
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
				/>
				<meta
					name="theme-color"
					content="#1971C2"
				/>
				<meta
					name="title"
					content="Markex"
				/>
				<meta
					name="description"
					content="View the latest Forex and Stock prices"
				/>
				<meta
					property="og:type"
					content="website"
				/>
				<meta
					property="og:url"
					content="http://markex.zectan.com/"
				/>
				<meta
					property="og:title"
					content="Markex"
				/>
				<meta
					property="og:description"
					content="View the latest Forex and Stock prices"
				/>
				<meta
					property="og:image"
					content="http://markex.zectan.com/logo.png"
				/>
				<link
					rel="icon"
					href="/favicon.ico"
				/>
				<link
					rel="apple-touch-icon"
					href="/favicon.ico"
				/>
				<link
					rel="manifest"
					href="/manifest.json"
				/>
			</Head>

			<SessionProvider session={session}>
				<ReduxProvider store={store}>
					<StockLivePricesProvider>
						<CurrencyPairPricesProvider>
							<MediaQueryProvider width={width}>
								<MantineProvider
									withGlobalStyles
									withNormalizeCSS
									theme={{ colorScheme: "dark" }}>
									<PWAUpdaterModal />
									<Notifications />
									<Component {...pageProps} />
								</MantineProvider>
							</MediaQueryProvider>
						</CurrencyPairPricesProvider>
					</StockLivePricesProvider>
				</ReduxProvider>
			</SessionProvider>
		</>
	)
}

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
	width: +getCookie("browser-width", ctx)!,
})
