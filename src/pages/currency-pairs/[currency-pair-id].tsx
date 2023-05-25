import Head from "next/head"
import { useContext, useEffect, useState } from "react"

import { SessionUser } from "@/@types/iron-session"
import { useCreateAppTransactionMutation } from "@/api/transactions"
import CandlestickChart from "@/components/CandlestickChart"
import Shell from "@/components/Shell"
import { CURRENCY, CURRENCY_PAIR } from "@/constants"
import CurrencyPairPricesContext from "@/contexts/CurrencyPairPricesContext"
import withSession from "@/utils/withSession"
import {
	Box, Button, Center, Divider, Flex, NumberInput, SegmentedControl, Skeleton, Stack, Text, Title,
	useMantineTheme
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { usePrevious } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { TransactionType } from "@prisma/client"
import { IconCaretDown, IconCaretUp, IconCheck } from "@tabler/icons-react"

type Props = {
	user: SessionUser | null
	currencyPair: CURRENCY_PAIR
}

function BidAskBox({
	type,
	price,
	color
}: {
	type: "Bid" | "Ask"
	price: number | null
	color: "green" | "red" | "white"
}) {
	const theme = useMantineTheme()

	const mantineColor = color === "white" ? "white" : theme.colors[color][5]

	return (
		<Box
			sx={{
				flex: 1,
				padding: "0.25rem 0.5rem",
				textAlign: type === "Bid" ? "start" : "end",
				border: `1px solid ${mantineColor}`,
				backgroundColor: `${mantineColor}22`
			}}>
			{price ? (
				<Flex
					direction={type === "Bid" ? "row" : "row-reverse"}
					align="center">
					<Text
						sx={{ width: "fit-content" }}
						fz="lg"
						color={mantineColor}
						weight={700}>
						{price}
					</Text>

					{color === "green" && (
						<IconCaretUp
							color="transparent"
							fill={mantineColor}
						/>
					)}

					{color === "red" && (
						<IconCaretDown
							color="transparent"
							fill={mantineColor}
						/>
					)}
				</Flex>
			) : (
				<Skeleton
					width="60%"
					height={19.9}
					ml={type === "Bid" ? 0 : "auto"}
					my={4}
				/>
			)}
			<Text
				fz="sm"
				color={mantineColor}>
				{type}
			</Text>
		</Box>
	)
}

function LowHighBox({ type, price }: { type: "Low" | "High"; price: number | null }) {
	return (
		<Box
			sx={{
				flex: 1,
				padding: "0 0.5rem",
				textAlign: type === "Low" ? "start" : "end"
			}}>
			<Text fz="sm">{type}</Text>
			{price ? (
				<Text weight={700}>{price}</Text>
			) : (
				<Skeleton
					width="60%"
					height={16.8}
					ml={type === "Low" ? 0 : "auto"}
					my={4}
				/>
			)}
		</Box>
	)
}

function DetailItem({
	label,
	value,
	color
}: {
	label: string
	value: string | number
	color?: string
}) {
	return (
		<Flex justify="space-between">
			<Text w="fit-content">{label}</Text>
			<Text
				color={color}
				weight={700}>
				{value}
			</Text>
		</Flex>
	)
}

export default function CurrencyPair({ user, currencyPair }: Props) {
	const [base, quote] = currencyPair.split("_") as [CURRENCY, CURRENCY]
	const currencyPairPretty = currencyPair?.replace("_", " / ")
	const theme = useMantineTheme()
	const { prices, setCurrencyPairs } = useContext(CurrencyPairPricesContext)
	const price = prices[currencyPair]

	const [createAppTransaction, { isLoading: createAppTransactionIsLoading }] =
		useCreateAppTransactionMutation()

	const [type, setType] = useState<"candlestick" | "ohlc">("candlestick")
	const [period, setPeriod] = useState<"H1" | "D" | "W" | "M">("H1")
	const [bidColor, setBidColor] = useState<"green" | "red" | "white">("white")
	const [askColor, setAskColor] = useState<"green" | "red" | "white">("white")
	const previousCurrencyPair = usePrevious(currencyPair)
	const previousPrice = usePrevious(prices[currencyPair])
	const form = useForm({
		initialValues: {
			mode: "sell",
			amount: 0 as number | undefined
		}
	})

	useEffect(() => {
		setCurrencyPairs([currencyPair])
	}, [currencyPair])

	useEffect(() => {
		if (price && previousPrice && currencyPair === previousCurrencyPair) {
			if (price.b !== previousPrice.b) {
				setAskColor(price.b > previousPrice.b ? "green" : "red")
			}

			if (price.s !== previousPrice.s) {
				setBidColor(price.s > previousPrice.s ? "green" : "red")
			}
		}
	}, [previousCurrencyPair, currencyPair, price, previousPrice])

	const onSubmit = form.onSubmit(async values => {
		if (price && values.amount) {
			const result = await createAppTransaction({
				id: URL.createObjectURL(new Blob([])).split("/").at(-1)!,
				currency_pair: currencyPair,
				type: values.mode as TransactionType,
				amount,
				price: values.mode === "sell" ? price.s : price.b
			})

			if ("data" in result) {
				form.setValues({ amount: 0 })
				notifications.show({
					withCloseButton: true,
					autoClose: 10000,
					message: `${
						values.mode === "sell" ? "Sold" : "Bought"
					} ${currencyPairPretty} ${amount}`,
					color: "green",
					icon: <IconCheck />
				})
			}
		}
	})

	const sellBuyValue = <T,>(sell: T, buy: T) => {
		return form.values.mode === "sell" ? sell : buy
	}

	const amount = form.values.amount || 0
	const tradeValue = amount * (price ? sellBuyValue(price.s, price.b) : 0)
	const initialBaseBalance = user?.app.balances[base] || 0
	const initialQuoteBalance = user?.app.balances[quote] || 0
	const finalBaseBalance = sellBuyValue(initialBaseBalance - amount, initialBaseBalance + amount)
	const finalQuoteBalance = sellBuyValue(
		initialQuoteBalance + tradeValue,
		initialQuoteBalance - tradeValue
	)

	return (
		<Shell user={user}>
			<Head>
				<title>{"Markex | " + currencyPairPretty}</title>
			</Head>

			<Flex
				sx={{ overflowY: "hidden" }}
				h="100%">
				<Flex
					sx={{ flex: 1 }}
					direction="column"
					gap="md">
					<Stack>
						<Title mt="md">{currencyPairPretty}</Title>

						{price ? (
							<Text
								sx={{
									display: "flex",
									alignItems: "center",
									color: price.c
										? theme.colors[price.c > 0 ? "green" : "red"][5]
										: "white"
								}}>
								{price.c > 0 ? (
									<IconCaretUp
										color="transparent"
										fill={theme.colors.green[5]}
									/>
								) : null}
								{price.c < 0 ? (
									<IconCaretDown
										color="transparent"
										fill={theme.colors.red[5]}
									/>
								) : null}
								<span>{price.c}%</span>
							</Text>
						) : (
							<Skeleton
								w={100}
								h={24.8}
							/>
						)}

						<Flex>
							<SegmentedControl
								color="blue"
								data={[
									{ label: "Candlestick", value: "candlestick" },
									{ label: "OHLC", value: "ohlc" }
								]}
								value={type}
								onChange={t => setType(t as typeof type)}
							/>

							<SegmentedControl
								color="blue"
								data={[
									{ label: "Hourly", value: "H1" },
									{ label: "Daily", value: "D" },
									{ label: "Weekly", value: "W" },
									{ label: "Monthly", value: "M" }
								]}
								value={period}
								onChange={p => setPeriod(p as typeof period)}
							/>
						</Flex>
					</Stack>

					<Box
						sx={{
							flex: 1,
							height: "100%",
							"& div": {
								height: "calc(100% - 3px) !important"
							}
						}}>
						<CandlestickChart
							type={type}
							currencyPair={currencyPair}
							period={period}
						/>
					</Box>
				</Flex>

				<Divider
					orientation="vertical"
					mx="md"
				/>

				<Stack sx={{ width: 320 }}>
					<Flex
						sx={{ position: "relative" }}
						gap="xs">
						<BidAskBox
							type="Bid"
							price={price?.s ?? null}
							color={askColor}
						/>
						<Box
							sx={{
								width: "20%",
								height: "60%",
								border: `1px solid ${theme.colors.blue[5]}`,
								backgroundColor: theme.colors.dark[7],
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								zIndex: 2
							}}>
							<Center
								sx={{
									width: "100%",
									height: "100%",
									backgroundColor: theme.colors.blue[5] + "22"
								}}>
								{price ? (
									<Text
										color={theme.colors.blue[5]}
										weight={700}>
										{price.sp}
									</Text>
								) : (
									<Skeleton
										width="60%"
										height={24.8}
									/>
								)}
							</Center>
						</Box>
						<BidAskBox
							type="Ask"
							price={price?.b ?? null}
							color={bidColor}
						/>
					</Flex>
					<Flex gap="xs">
						<LowHighBox
							type="Low"
							price={price?.l ?? null}
						/>
						<LowHighBox
							type="High"
							price={price?.h ?? null}
						/>
					</Flex>

					<Divider />

					{user ? (
						<>
							<SegmentedControl
								color={sellBuyValue("red", "blue")}
								data={[
									{ value: "sell", label: "Sell" },
									{ value: "buy", label: "Buy" }
								]}
								{...form.getInputProps("mode")}
							/>

							<NumberInput
								label="Amount"
								description={`Amount of ${base} to ${form.values.mode}`}
								hideControls
								onInput={e =>
									(e.currentTarget.value = e.currentTarget.value.replace(
										/[^0-9\.]/g,
										""
									))
								}
								{...form.getInputProps("amount")}
							/>

							<Stack spacing="0.25rem">
								<DetailItem
									label={`Initial ${base} Balance`}
									value={[base, initialBaseBalance.toFixed(5)].join(" ")}
								/>

								<DetailItem
									label={`Initial ${quote} Balance`}
									value={[quote, initialQuoteBalance.toFixed(5)].join(" ")}
								/>

								<DetailItem
									label={sellBuyValue("Deducted", "Added") + " Amount"}
									value={[base, sellBuyValue("-", "+") + amount.toFixed(5)].join(
										" "
									)}
								/>

								<DetailItem
									label={sellBuyValue("Added", "Deducted") + " Amount"}
									value={[
										quote,
										sellBuyValue("+", "-") + tradeValue.toFixed(5)
									].join(" ")}
								/>

								<DetailItem
									label={`Final ${base} Balance`}
									value={[base, finalBaseBalance.toFixed(5)].join(" ")}
									color={finalBaseBalance < 0 ? theme.colors.red[5] : undefined}
								/>

								<DetailItem
									label={`Final ${quote} Balance`}
									value={[quote, finalQuoteBalance.toFixed(5)].join(" ")}
									color={finalQuoteBalance < 0 ? theme.colors.red[5] : undefined}
								/>
							</Stack>

							<Button
								color={sellBuyValue("red", "blue")}
								onClick={() => onSubmit()}
								loading={createAppTransactionIsLoading}
								disabled={
									!price ||
									!amount ||
									finalBaseBalance < 0 ||
									finalQuoteBalance < 0
								}>
								Make Exchange
							</Button>
						</>
					) : (
						<Text
							align="center"
							c="dimmed"
							fz="xs">
							Sign in to Buy and Sell {currencyPairPretty}
						</Text>
					)}
				</Stack>
			</Flex>
		</Shell>
	)
}

export const getServerSideProps = withSession<Props>(async ({ session, params }) => {
	return {
		props: {
			user: session.user ?? null,
			currencyPair: params!["currency-pair-id"]
				.toUpperCase()
				.replace("-", "_") as CURRENCY_PAIR
		}
	}
})
