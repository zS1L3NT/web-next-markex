import { AppProps } from "next/app"
import { Provider as ReduxProvider } from "react-redux"

import Header from "@/components/Header"
import Navbar from "@/components/Navbar"
import { AuthProvider } from "@/contexts/AuthContext"
import store from "@/store"
import { AppShell, MantineProvider } from "@mantine/core"

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ReduxProvider store={store}>
			<AuthProvider>
				<MantineProvider
					withGlobalStyles
					withNormalizeCSS
					theme={{ colorScheme: "dark" }}>
					<AppShell
						sx={{ background: "rgb(20, 21, 23)" }}
						navbar={<Navbar />}
						header={<Header />}
						layout="alt">
						<Component {...pageProps} />
					</AppShell>
				</MantineProvider>
			</AuthProvider>
		</ReduxProvider>
	)
}
