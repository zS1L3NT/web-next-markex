import Document, { Head, Html, Main, NextScript } from "next/document"

import { createGetInitialProps } from "@mantine/next"

const getInitialProps = createGetInitialProps()

export default class _Document extends Document {
	static override getInitialProps = getInitialProps

	override render() {
		return (
			<Html>
				<Head />
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}
