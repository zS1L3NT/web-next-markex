import Document, { Head, Html, Main, NextScript } from "next/document"

import { createGetInitialProps } from "@mantine/next"

const getInitialProps = createGetInitialProps()

export default class _Document extends Document {
	static override getInitialProps = getInitialProps

	override render() {
		return (
			<Html>
				<Head>
					{/* eslint-disable-next-line @next/next/no-sync-scripts */}
					<script src="/cookie.js"></script>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}
