import Head from "next/head"
import { useRouter } from "next/router"
import { CSSProperties, useContext, useEffect, useState } from "react"

import { SessionUser } from "@/@types/iron-session"
import { OandaPrice } from "@/@types/oanda"
import Shell from "@/components/Shell"
import { COUNTRY_FLAGS, CURRENCY_PAIR, CURRENCY_PAIRS } from "@/constants"
import CurrencyPairPricesContext from "@/contexts/CurrencyPairPricesContext"
import UserContext from "@/contexts/UserContext"
import withSession from "@/utils/withSession"
import { ActionIcon, Flex, Loader, Stack, Table, Text, useMantineTheme } from "@mantine/core"
import { usePrevious } from "@mantine/hooks"
import { IconArrowsHorizontal, IconBookmark } from "@tabler/icons-react"

type Props = {
	user: SessionUser | null
}

function CurrencyPair({
	currencyPair,
	price
}: {
	currencyPair: CURRENCY_PAIR
	price: typeof OandaPrice.infer | null
}) {
	const [countryA, countryB] = currencyPair.split("_") as [
		keyof typeof COUNTRY_FLAGS,
		keyof typeof COUNTRY_FLAGS
	]

	const theme = useMantineTheme()
	const user = useContext(UserContext)
	const router = useRouter()

	const [buyStyle, setBuyStyle] = useState<CSSProperties>({})
	const [sellStyle, setSellStyle] = useState<CSSProperties>({})
	const [seconds, setSeconds] = useState(0)
	const previousPrice = usePrevious(price)

	useEffect(() => {
		setSeconds(0)
		const interval = setInterval(() => {
			setSeconds(seconds => seconds + 1)
		}, 1000)

		return () => clearInterval(interval)
	}, [price])

	useEffect(() => {
		if (price && previousPrice) {
			if (price.b !== previousPrice.b) {
				setBuyStyle({
					backgroundColor:
						price.b > previousPrice.b ? theme.colors.green[5] : theme.colors.green[5]
				})
				setTimeout(() => {
					setBuyStyle({
						transition: "background-color 1s ease",
						backgroundColor: "transparent"
					})
				}, 10)
			}

			if (price.s !== previousPrice.s) {
				setSellStyle({
					backgroundColor:
						price.s > previousPrice.s ? theme.colors.green[5] : theme.colors.red[5]
				})
				setTimeout(() => {
					setSellStyle({
						transition: "background-color 1s ease",
						backgroundColor: "transparent"
					})
				}, 10)
			}
		}
	}, [theme, price, previousPrice])

	const loader = (
		<Loader
			display="block"
			m="auto"
			color="gray"
			size="xs"
		/>
	)

	return (
		<tr style={{ textAlign: "center" }}>
			{user ? (
				<td>
					<ActionIcon>
						<IconBookmark
							fill={CURRENCY_PAIRS.indexOf(currencyPair) < 8 ? "white" : ""}
							size={20}
						/>
					</ActionIcon>
				</td>
			) : null}
			<td
				style={{ cursor: "pointer" }}
				onClick={() => router.push("/currency-pairs/" + currencyPair)}>
				<Flex
					align="center"
					gap="sm">
					<Stack
						sx={{ flexDirection: "row", alignItems: "center" }}
						spacing="0.5rem">
						<Text fz="1.25rem">{COUNTRY_FLAGS[countryA]}</Text>
						{countryA}
					</Stack>
					<IconArrowsHorizontal size={16} />
					<Stack
						sx={{ flexDirection: "row", alignItems: "center" }}
						spacing="0.5rem">
						{countryB}
						<Text fz="1.25rem">{COUNTRY_FLAGS[countryB]}</Text>
					</Stack>
				</Flex>
			</td>
			<td
				style={{
					color: price?.c
						? price.c > 0
							? theme.colors.green[5]
							: theme.colors.red[5]
						: "white"
				}}>
				{price ? `${price.c}%` : loader}
			</td>
			<td style={buyStyle}>{price?.b || loader}</td>
			<td style={sellStyle}>{price?.s || loader}</td>
			<td>{price?.l || loader}</td>
			<td>{price?.h || loader}</td>
			<td>{price?.sp || loader}</td>
			<td>{seconds === 0 ? "NOW" : `${seconds}s ago`}</td>
		</tr>
	)
}

export default function CurrencyPairs({ user }: Props) {
	const { prices, setCurrencyPairs } = useContext(CurrencyPairPricesContext)
	const theme = useMantineTheme()

	useEffect(() => {
		setCurrencyPairs([...CURRENCY_PAIRS])
	}, [])

	const numericHeaderStyle: CSSProperties = {
		width: "10%",
		textAlign: "center"
	}

	return (
		<Shell user={user}>
			<Head>
				<title>Markex | Currency Pairs</title>
			</Head>

			<Table
				bg={theme.colors.dark[7]}
				highlightOnHover
				withBorder
				withColumnBorders>
				<thead>
					<tr>
						{user ? <th style={{ width: 20 }}></th> : null}
						<th>Currency Pair</th>
						<th style={numericHeaderStyle}>Change</th>
						<th style={numericHeaderStyle}>Buy</th>
						<th style={numericHeaderStyle}>Sell</th>
						<th style={numericHeaderStyle}>Low</th>
						<th style={numericHeaderStyle}>High</th>
						<th style={numericHeaderStyle}>Spread</th>
						<th style={numericHeaderStyle}>Updated</th>
					</tr>
				</thead>
				<tbody>
					{CURRENCY_PAIRS.map(cp => (
						<CurrencyPair
							key={cp}
							currencyPair={cp}
							price={prices?.[cp] ?? null}
						/>
					))}
				</tbody>
			</Table>
		</Shell>
	)
}

export const getServerSideProps = withSession<Props>(async ({ session, params }) => {
	return {
		props: {
			user: session.user ?? null
		}
	}
})
