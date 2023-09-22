import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { CSSProperties, useContext, useEffect, useState } from "react"

import {
	ActionIcon,
	Box,
	Flex,
	Loader,
	Skeleton,
	Stack,
	Table,
	Title,
	useMantineTheme,
} from "@mantine/core"
import { usePrevious } from "@mantine/hooks"
import { IconArrowsHorizontal, IconBookmark } from "@tabler/icons-react"

import { OandaPrice } from "@/@types/oanda"
import { useGetBookmarksQuery, useUpdateBookmarksMutation } from "@/api/bookmarks"
import Shell from "@/components/Shell"
import { CURRENCY, CURRENCY_FLAGS, CURRENCY_PAIR, CURRENCY_PAIRS } from "@/constants"
import CurrencyPairPricesContext from "@/contexts/CurrencyPairPricesContext"

function CurrencyPair({
	currencyPair,
	price,
}: {
	currencyPair: CURRENCY_PAIR
	price: OandaPrice | null
}) {
	const [base, quote] = currencyPair.split("_") as [CURRENCY, CURRENCY]

	const { data: session } = useSession()
	const theme = useMantineTheme()

	const { data: bookmarks } = useGetBookmarksQuery(undefined, {
		pollingInterval: 60_000,
		skip: !session,
	})
	const [updateBookmarks, { isLoading: updateBookmarksIsLoading }] = useUpdateBookmarksMutation()

	const [bidStyle, setBidStyle] = useState<CSSProperties>({})
	const [askStyle, setAskStyle] = useState<CSSProperties>({})
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
				setAskStyle({
					backgroundColor: theme.colors[price.b > previousPrice.b ? "green" : "red"][5],
				})
				setTimeout(() => {
					setAskStyle({
						transition: "background-color 1s ease",
						backgroundColor: "transparent",
					})
				}, 10)
			}

			if (price.s !== previousPrice.s) {
				setBidStyle({
					backgroundColor: theme.colors[price.s > previousPrice.s ? "green" : "red"][5],
				})
				setTimeout(() => {
					setBidStyle({
						transition: "background-color 1s ease",
						backgroundColor: "transparent",
					})
				}, 10)
			}
		}
	}, [theme, price, previousPrice])

	const toggleBookmark = async () => {
		if (!bookmarks) return
		await updateBookmarks(
			bookmarks.includes(currencyPair)
				? bookmarks.filter(b => b !== currencyPair)
				: [...bookmarks, currencyPair],
		)
	}

	const loader = (
		<Skeleton
			width="100%"
			height={28}
		/>
	)

	return (
		<tr style={{ textAlign: "center" }}>
			{bookmarks && (
				<td>
					{!updateBookmarksIsLoading ? (
						<ActionIcon onClick={toggleBookmark}>
							<IconBookmark
								fill={bookmarks.includes(currencyPair) ? "white" : "transparent"}
								size={20}
							/>
						</ActionIcon>
					) : (
						<Loader
							size={28}
							color="gray"
							display="block"
							m="auto"
							p={4}
						/>
					)}
				</td>
			)}
			<td>
				<Link
					style={{
						color: "white",
						textDecoration: "none",
					}}
					href={"/currency-pairs/" + currencyPair.toLowerCase().replace("_", "-")}>
					<Flex
						align="center"
						gap="sm">
						<Stack
							sx={{ flexDirection: "row", alignItems: "center" }}
							spacing="0.5rem">
							<Image
								src={CURRENCY_FLAGS[base]}
								alt={base}
								width={32}
								height={24}
							/>
							{base}
						</Stack>
						<IconArrowsHorizontal size={16} />
						<Stack
							sx={{ flexDirection: "row", alignItems: "center" }}
							spacing="0.5rem">
							{quote}
							<Image
								src={CURRENCY_FLAGS[quote]}
								alt={quote}
								width={32}
								height={24}
							/>
						</Stack>
					</Flex>
				</Link>
			</td>
			<td
				style={{
					color: price?.c ? theme.colors[price.c > 0 ? "green" : "red"][5] : "white",
				}}>
				{price ? `${price.c}%` : loader}
			</td>
			<td style={bidStyle}>{price?.s || loader}</td>
			<td style={askStyle}>{price?.b || loader}</td>
			<td>{price?.l || loader}</td>
			<td>{price?.h || loader}</td>
			<td>{price?.sp || loader}</td>
			<td>{seconds === 0 ? "NOW" : `${seconds}s ago`}</td>
		</tr>
	)
}

export default function CurrencyPairs() {
	const { data: session } = useSession()
	const { prices } = useContext(CurrencyPairPricesContext)
	const theme = useMantineTheme()

	const numericHeaderStyle: CSSProperties = {
		width: "10%",
		textAlign: "center",
	}

	return (
		<Shell>
			<Head>
				<title>Markex | Currency Pairs</title>
			</Head>

			<Title my="md">Currency Pairs</Title>

			<Box sx={{ overflowX: "scroll", whiteSpace: "nowrap" }}>
				<Table
					bg={theme.colors.dark[6]}
					highlightOnHover
					withBorder
					withColumnBorders>
					<thead>
						<tr>
							{session ? <th style={{ width: 20 }} /> : null}
							<th>Currency Pair</th>
							<th style={numericHeaderStyle}>Change</th>
							<th style={numericHeaderStyle}>Bid</th>
							<th style={numericHeaderStyle}>Ask</th>
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
			</Box>
		</Shell>
	)
}
