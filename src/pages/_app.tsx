import { AppProps } from "next/app"
import { Provider as ReduxProvider } from "react-redux"

import { AuthProvider } from "@/contexts/AuthContext"
import store from "@/store"

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ReduxProvider store={store}>
			<AuthProvider>
				<Component {...pageProps} />
			</AuthProvider>
		</ReduxProvider>
	)
}
