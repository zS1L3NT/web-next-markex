import { Provider as ReduxProvider } from "react-redux"

import store from "@/store"

import type { AppProps } from "next/app"
export default function App({ Component, pageProps }: AppProps) {
	return (
		<ReduxProvider store={store}>
			<Component {...pageProps} />
		</ReduxProvider>
	)
}
