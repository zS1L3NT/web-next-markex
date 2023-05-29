import { AnimatePresence, motion } from "framer-motion"
import Head from "next/head"
import { useRouter } from "next/router"
import { useContext, useMemo, useState } from "react"

import { FidorInternalTransfer } from "@/@types/fidor"
import { SessionUser } from "@/@types/iron-session"
import {
	useCreateAppTransactionMutation, useCreateFidorInternalTransferMutation,
	useGetFidorInternalTransfersQuery
} from "@/api/transactions"
import Shell from "@/components/Shell"
import { CURRENCIES, CURRENCY, CURRENCY_FLAGS } from "@/constants"
import UserContext from "@/contexts/UserContext"
import withSession from "@/utils/withSession"
import {
	ActionIcon, Badge, Box, Button, Card, Divider, Drawer, Flex, Grid, NumberInput, Stack, Table,
	Text, Title, useMantineTheme
} from "@mantine/core"
import { useDisclosure, useMediaQuery } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { Transaction, TransactionType } from "@prisma/client"
import { IconCheck, IconShoppingCart } from "@tabler/icons-react"

type Props = {
	user: SessionUser
}

function FidorToMarkex({ isDrawer = false }: { isDrawer?: boolean }) {
	const router = useRouter()
	const { user } = useContext(UserContext)

	const [createAppTransaction] = useCreateAppTransactionMutation()
	const [createFidorInternalTransfer] = useCreateFidorInternalTransferMutation()

	const [amount, setAmount] = useState<number | "">(0)
	const [isLoading, setIsLoading] = useState(false)

	const handleTransaction = async () => {
		if (amount) {
			setIsLoading(true)

			const uuid = URL.createObjectURL(new Blob([])).split("/").at(-1)! // UUID hack
			const fidorResult = await createFidorInternalTransfer({
				external_uid: uuid,
				account_id: user!.fidor.id!,
				amount,
				receiver: "11874237",
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

	return (
		<Stack w={isDrawer ? "100%" : 250}>
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
	)
}

export default function Wallet({ user }: Props) {
	const theme = useMantineTheme()

	const isAboveLg = useMediaQuery(`(min-width: ${theme.breakpoints.lg})`)

	const { data: transfers } = useGetFidorInternalTransfersQuery()

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
	const [opened, { open, close }] = useDisclosure(false)

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
				<Stack
					sx={{ flex: 1 }}
					w="100%">
					<Flex
						mt="md"
						justify="space-between"
						align="center">
						<Title w="fit-content">Wallet</Title>
						{!isAboveLg && (
							<ActionIcon
								size="lg"
								variant="light"
								onClick={open}>
								<IconShoppingCart />
							</ActionIcon>
						)}
					</Flex>

					<Grid
						columns={42}
						gutter={isAboveLg ? 12 : 6}>
						{CURRENCIES.map(c => (
							<Grid.Col
								key={c}
								sm={14}
								md={6}
								span={21}>
								<Card
									withBorder
									p="xs">
									<Text
										align="center"
										truncate>
										{CURRENCY_FLAGS[c]} {c}{" "}
									</Text>
									<Text
										align="center"
										weight={700}
										truncate>
										{(user.app.balances[c] ?? 0).toFixed(5)}
									</Text>
								</Card>
							</Grid.Col>
						))}
					</Grid>

					<Box sx={{ overflowX: "scroll", whiteSpace: "nowrap" }}>
						<Table
							sx={{
								"& th:not(:first-of-type), & td:not(:first-of-type)": {
									textAlign: "center !important" as "center"
								},
								borderRadius: 5
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
												{(
													(t.app?.amount ?? t.fidor?.amount ?? 0) *
													(t.app?.price ?? 0)
												).toFixed(5)}
												{" " + getCurrency(t, "sell")}
											</td>
											<td>
												{t.app?.currency_pair?.replace("_", " / ") ?? "-"}
											</td>
											<td>{t.app?.price.toFixed(5) ?? "-"}</td>
										</motion.tr>
									))}
								</AnimatePresence>
							</tbody>
						</Table>
					</Box>
				</Stack>

				{isAboveLg ? (
					<>
						<Divider
							orientation="vertical"
							mx="md"
						/>

						<FidorToMarkex />
					</>
				) : (
					<Drawer
						opened={opened}
						onClose={close}
						position="right">
						<FidorToMarkex isDrawer />
					</Drawer>
				)}
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
