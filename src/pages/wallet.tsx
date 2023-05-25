import { AnimatePresence, motion } from "framer-motion"
import Head from "next/head"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"

import { FidorInternalTransfer } from "@/@types/fidor"
import { SessionUser } from "@/@types/iron-session"
import {
	useCreateAppTransactionMutation, useCreateFidorInternalTransferMutation,
	useGetFidorInternalTransfersQuery
} from "@/api/transactions"
import Shell from "@/components/Shell"
import { CURRENCIES, CURRENCY, CURRENCY_FLAGS } from "@/constants"
import withSession from "@/utils/withSession"
import {
	Badge, Button, Card, Divider, Flex, Grid, NumberInput, Stack, Table, Text, Title,
	useMantineTheme
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { Transaction, TransactionType } from "@prisma/client"
import { IconCheck } from "@tabler/icons-react"

type Props = {
	user: SessionUser
}

export default function Wallet({ user }: Props) {
	const theme = useMantineTheme()
	const router = useRouter()

	const [createAppTransaction] = useCreateAppTransactionMutation()
	const [createFidorInternalTransfer] = useCreateFidorInternalTransferMutation()
	const { data: transfers } = useGetFidorInternalTransfersQuery()

	const [amount, setAmount] = useState<number | "">(0)
	const [isLoading, setIsLoading] = useState(false)
	const transactions: {
		id: string
		date: Date
		app: Transaction | null
		fidor: FidorInternalTransfer | null
	}[] = useMemo(
		() =>
			[
				...user.app.transactions.map(t => ({
					id: t.id,
					date: new Date(t.created_at),
					app: t,
					fidor: transfers?.data.find(tf => tf.external_uid === t.id) ?? null
				})),
				...(transfers?.data ?? [])
					.filter(t => !user.app.transactions.find(tx => tx.id === t.external_uid))
					.map(t => ({
						id: t.id!,
						date: new Date(t.created_at!),
						app: null,
						fidor: t
					}))
			].sort((a, b) => b.date.getTime() - a.date.getTime()),
		[user, transfers]
	)

	const handleTransaction = async () => {
		if (amount) {
			setIsLoading(true)

			const uuid = URL.createObjectURL(new Blob([])).split("/").at(-1)! // UUID hack
			const fidorResult = await createFidorInternalTransfer({
				external_uid: uuid,
				account_id: user.fidor.id!,
				amount,
				receiver: "83272201", // I am the team leader LMAO
				currency: "SGD"
			})
			if ("data" in fidorResult) {
				const appResult = await createAppTransaction({
					id: uuid,
					currency_pair: null,
					type: "buy",
					amount,
					price: 1
				})
				if ("data" in appResult) {
					setAmount(0)
					router.push(router.asPath)
					notifications.show({
						withCloseButton: true,
						autoClose: 10000,
						message: `Deposited SGD ${amount}`,
						color: "green",
						icon: <IconCheck />
					})
				}
			}

			setIsLoading(false)
		}
	}

	const getCurrency = (t: (typeof transactions)[number], tt: TransactionType): CURRENCY =>
		(t.fidor?.currency as CURRENCY | undefined) ||
		(t.app?.currency_pair
			? (t.app!.currency_pair!.split("_")[Number(t.app!.type === tt)]! as CURRENCY)
			: "SGD")

	return (
		<Shell user={user}>
			<Head>
				<title>Markex | Wallet</title>
			</Head>

			<Flex>
				<Stack sx={{ flex: 1 }}>
					<Title mt="md">Wallet</Title>

					<Grid
						columns={21}
						gutter={12}>
						{CURRENCIES.map(c => (
							<Grid.Col
								key={c}
								span={3}>
								<Card p="xs">
									<Text align="center">
										{CURRENCY_FLAGS[c]} {c}{" "}
									</Text>
									<Text
										align="center"
										weight={700}>
										{(user.app.balances[c] ?? 0).toFixed(5)}
									</Text>
								</Card>
							</Grid.Col>
						))}
					</Grid>

					<Table
						sx={{
							"& th:not(:first-of-type), & td:not(:first-of-type)": {
								textAlign: "center !important" as "center"
							}
						}}
						bg={theme.colors.dark[6]}
						withBorder
						withColumnBorders>
						<thead>
							<tr>
								<th>Transaction Date</th>
								<th>Type</th>
								<th>Paid</th>
								<th>Received</th>
								<th>Currency Pair</th>
								<th>Price</th>
							</tr>
						</thead>
						<tbody>
							<AnimatePresence>
								{transactions.map(t => (
									<motion.tr
										key={t.id}
										layoutId={t.id}
										style={{ background: theme.colors.dark[6] }}>
										<td>
											{t.date.toLocaleString("en-SG", {
												year: "numeric",
												month: "long",
												day: "numeric",
												hour: "numeric",
												minute: "numeric",
												second: "numeric"
											})}
										</td>
										<td>
											{t.app?.currency_pair === null ? (
												<Badge color="green">Deposit</Badge>
											) : t.app ? (
												<Badge color="red">Exchange</Badge>
											) : (
												<Badge color="blue">Fidor</Badge>
											)}
										</td>
										<td>
											{(t.app?.amount ?? t.fidor?.amount)?.toFixed(5)}
											{" " + getCurrency(t, "buy")}
										</td>
										<td>
											{((t.app?.amount ?? t.fidor?.amount ?? 0) * (t.app?.price ?? 0)).toFixed(5)}
											{" " + getCurrency(t, "sell")}
										</td>
										<td>{t.app?.currency_pair?.replace("_", " / ") ?? "-"}</td>
										<td>{t.app?.price.toFixed(5) ?? "-"}</td>
									</motion.tr>
								))}
							</AnimatePresence>
						</tbody>
					</Table>
				</Stack>

				<Divider
					orientation="vertical"
					mx="md"
				/>

				<Stack w={250}>
					<Title
						mt="md"
						order={2}>
						Fidor to Markex
					</Title>

					<Text
						c="dimmed"
						fz="xs">
						Transfer SGD from your Fidor Bank Account to your Markex Wallet!
					</Text>

					<NumberInput
						label="Amount"
						description="Amount of SGD to transfer"
						value={amount}
						onChange={setAmount}
						hideControls
					/>

					<Button
						color="green"
						onClick={handleTransaction}
						loading={isLoading}
						disabled={!amount}>
						Transfer
					</Button>
				</Stack>
			</Flex>
		</Shell>
	)
}

export const getServerSideProps = withSession<Props>(async ({ session }) => {
	if (session.user) {
		return {
			props: {
				user: session.user
			}
		}
	} else {
		return {
			notFound: true
		}
	}
})
