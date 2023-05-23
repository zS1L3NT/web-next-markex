import Head from "next/head"
import Link from "next/link"
import { CSSProperties, useContext, useEffect, useState } from "react"

import { SessionUser } from "@/@types/iron-session"
import { OandaPrice } from "@/@types/oanda"
import { useUpdateAppUserMutation } from "@/api/users"
import Shell from "@/components/Shell"
import { CURRENCY, CURRENCY_FLAGS, CURRENCY_PAIR, CURRENCY_PAIRS } from "@/constants"
import CurrencyPairPricesContext from "@/contexts/CurrencyPairPricesContext"
import UserContext from "@/contexts/UserContext"
import withSession from "@/utils/withSession"
import {
	ActionIcon, Flex, Loader, Skeleton, Stack, Table, Text, useMantineTheme
} from "@mantine/core"
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
	price: OandaPrice | null
}) {
	const [currencyA, currencyB] = currencyPair.split("_") as [CURRENCY, CURRENCY]

	const theme = useMantineTheme()
	const { user, setUser } = useContext(UserContext)

	const [updateAppUser, { isLoading: updateAppUserIsLoading }] = useUpdateAppUserMutation()

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
					backgroundColor:
						price.b > previousPrice.b ? theme.colors.green[5] : theme.colors.green[5]
				})
				setTimeout(() => {
					setAskStyle({
						transition: "background-color 1s ease",
						backgroundColor: "transparent"
					})
				}, 10)
			}

			if (price.s !== previousPrice.s) {
				setBidStyle({
					backgroundColor:
						price.s > previousPrice.s ? theme.colors.green[5] : theme.colors.red[5]
				})
				setTimeout(() => {
					setBidStyle({
						transition: "background-color 1s ease",
						backgroundColor: "transparent"
					})
				}, 10)
			}
		}
	}, [theme, price, previousPrice])

	const toggleBookmark = async () => {
		if (!user) return

		const appUser = await updateAppUser({
			bookmarks: user.app.bookmarks.includes(currencyPair)
				? user.app.bookmarks.filter(b => b !== currencyPair)
				: [...user.app.bookmarks, currencyPair]
		})

		if ("data" in appUser) {
			setUser({
				...user,
				app: appUser.data
			})
		}
	}

	const loader = (
		<Skeleton
			width="100%"
			height={30}
		/>
	)

	return (
		<tr style={{ textAlign: "center" }}>
			{user ? (
				<td>
					{!updateAppUserIsLoading ? (
						<ActionIcon onClick={toggleBookmark}>
							<IconBookmark
								fill={
									user.app.bookmarks.includes(currencyPair)
										? "white"
										: "transparent"
								}
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
			) : null}
			<td>
				<Link
					style={{
						color: "white",
						textDecoration: "none"
					}}
					href={"/currency-pairs/" + currencyPair}>
					<Flex
						align="center"
						gap="sm">
						<Stack
							sx={{ flexDirection: "row", alignItems: "center" }}
							spacing="0.5rem">
							<Text fz="1.25rem">{CURRENCY_FLAGS[currencyA]}</Text>
							{currencyA}
						</Stack>
						<IconArrowsHorizontal size={16} />
						<Stack
							sx={{ flexDirection: "row", alignItems: "center" }}
							spacing="0.5rem">
							{currencyB}
							<Text fz="1.25rem">{CURRENCY_FLAGS[currencyB]}</Text>
						</Stack>
					</Flex>
				</Link>
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
			<td style={bidStyle}>{price?.s || loader}</td>
			<td style={askStyle}>{price?.b || loader}</td>
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
				bg={theme.colors.dark[6]}
				highlightOnHover
				withBorder
				withColumnBorders>
				<thead>
					<tr>
						{user ? <th style={{ width: 20 }}></th> : null}
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
