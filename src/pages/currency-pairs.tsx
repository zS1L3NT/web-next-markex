import Head from "next/head"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"

import { OandaPrice } from "@/@types/oanda"
import { COUNTRY_FLAGS, CURRENCY_PAIR, CURRENCY_PAIRS } from "@/constants"
import CurrencyPairPricesContext from "@/contexts/CurrencyPairPricesContext"
import { ActionIcon, Flex, Loader, Stack, Table, Text, useMantineTheme } from "@mantine/core"
import { usePrevious } from "@mantine/hooks"
import { IconArrowsHorizontal, IconBookmark } from "@tabler/icons-react"

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

	const router = useRouter()

	const [seconds, setSeconds] = useState(0)
	const previousPrice = usePrevious(price)

	useEffect(() => {
		setSeconds(0)
		const interval = setInterval(() => {
			setSeconds(seconds => seconds + 1)
		}, 1000)

		return () => clearInterval(interval)
	}, [price])

	const loader = (
		<Loader
			color="gray"
			size="xs"
			display="block"
			my="auto"
		/>
	)

	return (
		<tr>
			<td>
				<ActionIcon>
					<IconBookmark
						fill={CURRENCY_PAIRS.indexOf(currencyPair) < 8 ? "white" : ""}
						size={20}
					/>
				</ActionIcon>
			</td>
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
			<td>{price ? `${price.c}%` : loader}</td>
			<td>{price?.b || loader}</td>
			<td>{price?.s || loader}</td>
			<td>{price?.l || loader}</td>
			<td>{price?.h || loader}</td>
			<td>{price?.sp || loader}</td>
			<td>{seconds === 0 ? "NOW" : `${seconds}s ago`}</td>
		</tr>
	)
}

export default function CurrencyPairs() {
	const { prices, setCurrencyPairs } = useContext(CurrencyPairPricesContext)
	const theme = useMantineTheme()

	useEffect(() => {
		setCurrencyPairs([...CURRENCY_PAIRS])
	}, [])

	return (
		<>
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
						<th style={{ width: 20 }}></th>
						<th>Currency Pair</th>
						<th style={{ width: "10%" }}>Change</th>
						<th style={{ width: "10%" }}>Buy</th>
						<th style={{ width: "10%" }}>Sell</th>
						<th style={{ width: "10%" }}>Low</th>
						<th style={{ width: "10%" }}>High</th>
						<th style={{ width: "10%" }}>Spread</th>
						<th style={{ width: "10%" }}>Updated</th>
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
		</>
	)
}
